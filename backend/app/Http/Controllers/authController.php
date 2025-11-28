<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Accounts\accountRequest;
use App\Services\authService;
use App\Services\psgcApiService;
use App\Models\accounts\accountClass;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class authController extends Controller
{
    protected $authService;
    protected $accountClass;
    protected $psgcService;

    public function __construct()
    {
        $this->authService = new authService();
        $this->accountClass = new accountClass();
        $this->psgcService = new psgcApiService();
    }



    public function showLoginForm()
    {
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Login form data',
                'form_config' => [
                    'action' => '/accounts/login',
                    'method' => 'POST',
                    'fields' => [
                        'username' => [
                            'type' => 'text',
                            'required' => true,
                            'label' => 'Username or Email'
                        ],
                        'password' => [
                            'type' => 'password',
                            'required' => true,
                            'label' => 'Password'
                        ]
                    ]
                ]
            ], 200);
        } else {
            return view('accounts.login');
        }
    }

    // Handle login
    public function login(accountRequest $request)
    {
        $result = $this->authService->login($request->username, $request->password);

        if ($result['success']) {
            Session::put('user', $result['user']);
            Session::put('userType', $result['userType']);
            // Set default current role for session-based role tracking
            $user = $result['user'];
            if ($user->user_type === 'both') {
                Session::put('current_role', 'contractor');
            } elseif ($user->user_type === 'property_owner') {
                Session::put('current_role', 'owner');
            } else {
                Session::put('current_role', $user->user_type); // 'contractor'
            }

            if ($request->expectsJson()) {

                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $result['user'],
                    'userType' => $result['userType'],
                    // TODO: Add token here when Sanctum is installed
                    // 'token' => $user->createToken('mobile-app')->plainTextToken
                ], 200);
            } else {

                if ($result['userType'] === 'admin') {
                    return redirect('/admin/dashboard')->with('success', 'Welcome Admin!');
                } else {
                    return redirect('/dashboard')->with('success', 'Welcome back!');
                }
            }
        } else {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'errors' => []
                ], 401);
            } else {
                return back()->withErrors(['login' => $result['message']])->withInput();
            }
        }
    }

    // Show signup form
    public function showSignupForm()
    {
        // Values ng dropdowns
        $contractorTypes = $this->accountClass->getContractorTypes();
        $occupations = $this->accountClass->getOccupations();
        $validIds = $this->accountClass->getValidIds();
        $provinces = $this->psgcService->getProvinces();
        $picabCategories = $this->accountClass->getPicabCategories();

        if (request()->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Signup form data',
                'data' => [
                    'contractor_types' => $contractorTypes,
                    'occupations' => $occupations,
                    'valid_ids' => $validIds,
                    'provinces' => $provinces,
                    'picab_categories' => $picabCategories
                ]
            ], 200);
        } else {

            return view('accounts.signup', compact('contractorTypes', 'occupations', 'validIds', 'provinces', 'picabCategories'));
        }
    }

    // Handle role selection
    public function selectRole(accountRequest $request)
    {
        Session::put('signup_user_type', $request->user_type);
        Session::put('signup_step', 1);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Role selected successfully',
                'user_type' => $request->user_type,
                'next_step' => 'step1'
            ], 200);
        } else {
            return response()->json(['success' => true, 'user_type' => $request->user_type]);
        }
    }

    // Handle Contractor Step 1
    public function contractorStep1(accountRequest $request)
    {
        $businessAddress = $request->business_address_street . ', ' .
                          $request->business_address_barangay . ', ' .
                          $request->business_address_city . ', ' .
                          $request->business_address_province . ' ' .
                          $request->business_address_postal;

        $step1Data = [
            'company_name' => $request->company_name,
            'company_phone' => $request->company_phone,
            'years_of_experience' => $request->years_of_experience,
            'type_id' => $request->contractor_type_id,
            'contractor_type_other' => $request->contractor_type_other_text,
            'services_offered' => $request->services_offered,
            'business_address' => $businessAddress,
            'company_website' => $request->company_website,
            'company_social_media' => $request->company_social_media
        ];

        // Para istore lang to yung sa step 1 inputs
        // Only treat as switch mode if user is logged in na and verified signup na
        $user = Session::get('user');
        if ($user && isset($user->is_verified) && $user->is_verified == 1) {
            Session::put('switch_contractor_step1', $step1Data);
        }

        Session::put('contractor_step1', $step1Data);

        Session::put('signup_step', 2);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Contractor step 1 completed',
                'step' => 2,
                'next_step' => 'contractor_step2'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 2]);
        }
    }

    // Handle Contractor Step 2
    public function contractorStep2(accountRequest $request)
    {

        // Generate and send OTP
        $otp = $this->authService->generateOtp();
        $otpHash = $this->authService->hashOtp($otp);
        $this->authService->sendOtpEmail($request->company_email, $otp);

        // Store in session
        Session::put('contractor_step2', [
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'username' => $request->username,
            'company_email' => $request->company_email,
            'password' => $request->password,
            'otp_hash' => $otpHash
        ]);

        Session::put('signup_step', 3);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'OTP sent to email',
                'step' => 3,
                'next_step' => 'verify_otp'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 3, 'message' => 'OTP sent to email']);
        }
    }

    // Contractor Step 3
    public function contractorVerifyOtp(accountRequest $request)
    {
        $step2Data = Session::get('contractor_step2');

        // Verify OTP
        if (!$this->authService->verifyOtp($request->otp, $step2Data['otp_hash'])) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid OTP',
                    'errors' => ['otp' => ['Invalid OTP']]
                ], 422);
            } else {
                return response()->json([
                    'success' => false,
                    'errors' => ['otp' => ['Invalid OTP']]
                ], 422);
            }
        }

        Session::put('signup_step', 4);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully',
                'step' => 4,
                'next_step' => 'contractor_step4'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 4]);
        }
    }

    // Contractor Step 4
    public function contractorStep4(accountRequest $request)
    {
        // Handle file upload
        $dtiSecPath = $request->file('dti_sec_registration_photo')->store('DTI_SEC', 'public');

        Session::put('contractor_step4', [
            'picab_number' => $request->picab_number,
            'picab_category' => $request->picab_category,
            'picab_expiration_date' => $request->picab_expiration_date,
            'business_permit_number' => $request->business_permit_number,
            'business_permit_city' => $request->business_permit_city,
            'business_permit_expiration' => $request->business_permit_expiration,
            'tin_business_reg_number' => $request->tin_business_reg_number,
            'dti_sec_registration_photo' => $dtiSecPath
        ]);

        Session::put('signup_step', 5);

        return response()->json(['success' => true, 'step' => 5]);
    }

    // Handle Contractor Final Step
    public function contractorFinalStep(accountRequest $request)
    {
        // Get all session data
        $step1 = Session::get('contractor_step1');
        $step2 = Session::get('contractor_step2');
        $step4 = Session::get('contractor_step4');

        // \Log::info('Contractor Final - Step1: ' . ($step1 ? 'EXISTS' : 'NULL'));
        // \Log::info('Contractor Final - Step2: ' . ($step2 ? 'EXISTS' : 'NULL'));
        // \Log::info('Contractor Final - Step4: ' . ($step4 ? 'EXISTS' : 'NULL'));
        // \Log::info('All Session Keys: ' . json_encode(Session::all()));

        // Check if all required session data exists
        if (!$step1 || !$step2 || !$step4) {
            $missing = [];
            if (!$step1) {
                $missing[] = 'Step 1 data';
            }
            if (!$step2) {
                $missing[] = 'Step 2 data';
            }
            if (!$step4) {
                $missing[] = 'Step 4 data';
            }

            return response()->json([
                'success' => false,
                'errors' => ['Session expired. Missing: ' . implode(', ', $missing) . '. Please start the registration process again.']
            ], 400);
        }

        $profilePicPath = null;
        if ($request->hasFile('profile_pic')) {
            $profilePicPath = $request->file('profile_pic')->store('profiles', 'public');
        }

        // Create user
        $userId = $this->accountClass->createUser([
            'profile_pic' => $profilePicPath,
            'username' => $step2['username'],
            'email' => $step2['company_email'],
            'password_hash' => $this->authService->hashPassword($step2['password']),
            'OTP_hash' => $step2['otp_hash'],
            'user_type' => 'contractor'
        ]);

        // Create contractor
        $contractorId = $this->accountClass->createContractor([
            'user_id' => $userId,
            'company_name' => $step1['company_name'],
            'years_of_experience' => $step1['years_of_experience'],
            'type_id' => $step1['type_id'],
            'contractor_type_other' => $step1['contractor_type_other'] ?? null,
            'services_offered' => $step1['services_offered'],
            'business_address' => $step1['business_address'],
            'company_email' => $step2['company_email'],
            'company_phone' => $step1['company_phone'],
            'company_website' => $step1['company_website'],
            'company_social_media' => $step1['company_social_media'],
            'picab_number' => $step4['picab_number'],
            'picab_category' => $step4['picab_category'],
            'picab_expiration_date' => $step4['picab_expiration_date'],
            'business_permit_number' => $step4['business_permit_number'],
            'business_permit_city' => $step4['business_permit_city'],
            'business_permit_expiration' => $step4['business_permit_expiration'],
            'tin_business_reg_number' => $step4['tin_business_reg_number'],
            'dti_sec_registration_photo' => $step4['dti_sec_registration_photo']
        ]);

        // Create contractor user
        $this->accountClass->createContractorUser([
            'contractor_id' => $contractorId,
            'user_id' => $userId,
            'first_name' => $step2['first_name'],
            'middle_name' => $step2['middle_name'],
            'last_name' => $step2['last_name'],
            'phone_number' => $step1['company_phone']
        ]);

        // Clear session
        Session::forget(['signup_user_type', 'signup_step', 'contractor_step1', 'contractor_step2', 'contractor_step4']);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please wait for admin approval.',
                'user_id' => $userId,
                'contractor_id' => $contractorId,
                'redirect_url' => '/accounts/login'
            ], 201);
        } else {

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please wait for admin approval.',
                'redirect' => '/accounts/login'
            ]);
        }
    }

    // Handle Property Owner Step 1
    public function propertyOwnerStep1(accountRequest $request)
    {
        // Age
        $age = $this->authService->calculateAge($request->date_of_birth);

        // Combine address
        $address = $request->owner_address_street . ', ' .
                   $request->owner_address_barangay . ', ' .
                   $request->owner_address_city . ', ' .
                   $request->owner_address_province . ', ' .
                   $request->owner_address_postal;

        $step1Data = [
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'occupation_id' => $request->occupation_id,
            'occupation_other' => $request->occupation_other_text,
            'date_of_birth' => $request->date_of_birth,
            'phone_number' => $request->phone_number,
            'age' => $age,
            'address' => $address
        ];

        // Only treat as switch mode if user is logged in and verified na ang signup (just like the contractor)
        $user = Session::get('user');
        if ($user && isset($user->is_verified) && $user->is_verified == 1) {
            Session::put('switch_owner_step1', $step1Data);
        }

        Session::put('owner_step1', $step1Data);

        Session::put('signup_step', 2);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Contractor step 1 completed',
                'step' => 2,
                'next_step' => 'contractor_step2'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 2]);
        }
    }

    // Handle Property Owner Step 2
    public function propertyOwnerStep2(accountRequest $request)
    {

        // Generate and send OTP
        $otp = $this->authService->generateOtp();
        $otpHash = $this->authService->hashOtp($otp);
        $this->authService->sendOtpEmail($request->email, $otp);

        Session::put('owner_step2', [
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password,
            'otp_hash' => $otpHash
        ]);

        Session::put('signup_step', 3);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'OTP sent to email',
                'step' => 3,
                'next_step' => 'verify_otp'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 3, 'message' => 'OTP sent to email']);
        }
    }

    // Property Owner Step 3
    public function propertyOwnerVerifyOtp(accountRequest $request)
    {
        $step2Data = Session::get('owner_step2');

        // Verify OTP
        if (!$this->authService->verifyOtp($request->otp, $step2Data['otp_hash'])) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid OTP',
                    'errors' => ['otp' => ['Invalid OTP']]
                ], 422);
            } else {
                return response()->json([
                    'success' => false,
                    'errors' => ['otp' => ['Invalid OTP']]
                ], 422);
            }
        }

        Session::put('signup_step', 4);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'OTP verified successfully',
                'step' => 4,
                'next_step' => 'property_owner_step4'
            ], 200);
        } else {

            return response()->json(['success' => true, 'step' => 4]);
        }
    }

    // Property Owner Step 4
    public function propertyOwnerStep4(accountRequest $request)
    {
        // Handle file uploads
        $validIdPath = null;
        $validIdBackPath = null;
        $policeClearancePath = null;

        if ($request->hasFile('valid_id_photo')) {
            $validIdPath = $request->file('valid_id_photo')->store('validID', 'public');
        }

        if ($request->hasFile('valid_id_back_photo')) {
            $validIdBackPath = $request->file('valid_id_back_photo')->store('validID', 'public');
        }

        if ($request->hasFile('police_clearance')) {
            $policeClearancePath = $request->file('police_clearance')->store('policeClearance', 'public');
        }

        Session::put('owner_step4', [
            'valid_id_id' => $request->valid_id_id,
            'valid_id_photo' => $validIdPath,
            'valid_id_back_photo' => $validIdBackPath,
            'police_clearance' => $policeClearancePath
        ]);

        Session::put('signup_step', 5);

        return response()->json(['success' => true, 'step' => 5]);
    }

    // Handle Property Owner Final Step
    public function propertyOwnerFinalStep(accountRequest $request)
    {
        // Get all session data
        $step1 = Session::get('owner_step1');
        $step2 = Session::get('owner_step2');
        $step4 = Session::get('owner_step4');

        // Check if all required session data exists
        if (!$step1 || !$step2 || !$step4) {
            $missing = [];
            if (!$step1) {
                $missing[] = 'Step 1 data';
            }
            if (!$step2) {
                $missing[] = 'Step 2 data';
            }
            if (!$step4) {
                $missing[] = 'Step 4 data';
            }

            return response()->json([
                'success' => false,
                'errors' => ['Session expired. Missing: ' . implode(', ', $missing) . '. Please start the registration process again.']
            ], 400);
        }

        $profilePicPath = null;
        if ($request->hasFile('profile_pic')) {
            $profilePicPath = $request->file('profile_pic')->store('profiles', 'public');
        }

        // Create user
        $userId = $this->accountClass->createUser([
            'profile_pic' => $profilePicPath,
            'username' => $step2['username'],
            'email' => $step2['email'],
            'password_hash' => $this->authService->hashPassword($step2['password']),
            'OTP_hash' => $step2['otp_hash'],
            'user_type' => 'property_owner'
        ]);

        // Create property owner
        $this->accountClass->createPropertyOwner([
            'user_id' => $userId,
            'first_name' => $step1['first_name'],
            'middle_name' => $step1['middle_name'],
            'last_name' => $step1['last_name'],
            'phone_number' => $step1['phone_number'],
            'valid_id_id' => $step4['valid_id_id'],
            'valid_id_photo' => $step4['valid_id_photo'],
            'valid_id_back_photo' => $step4['valid_id_back_photo'],
            'police_clearance' => $step4['police_clearance'],
            'date_of_birth' => $step1['date_of_birth'],
            'age' => $step1['age'],
            'occupation_id' => $step1['occupation_id'],
            'occupation_other' => $step1['occupation_other'] ?? null,
            'address' => $step1['address']
        ]);

        // Clear session
        Session::forget(['signup_user_type', 'signup_step', 'owner_step1', 'owner_step2', 'owner_step4']);

        if ($request->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! You can now login.',
                'user_id' => $userId,
                'redirect_url' => '/accounts/login'
            ], 201);
        } else {

            return response()->json([
                'success' => true,
                'message' => 'Registration successful! Please wait for verification.',
                'redirect' => '/accounts/login'
            ]);
        }
    }

    // Logout
    public function logout()
    {
        Session::flush();

        if (request()->expectsJson()) {

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } else {

            return redirect('/accounts/login')->with('success', 'Logged out successfully');
        }
    }

    // ROLE SWITCHING METHODS

    // Show role switch form
    public function showSwitchForm()
    {
        if (!Session::has('user')) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required',
                    'redirect_url' => '/accounts/login'
                ], 401);
            } else {
                return redirect('/accounts/login')->with('error', 'Please login first');
            }
        }

        $user = Session::get('user');
        $currentRole = $user->user_type;

        // Check if user already has both roles
        if ($user->user_type === 'both') {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have both roles',
                    'redirect_url' => '/dashboard'
                ], 400);
            } else {
                return redirect('/dashboard')->with('error', 'You already have both roles');
            }
        }

        // Get data para sa dropdowns (same as signup)
        $contractorTypes = $this->accountClass->getContractorTypes();
        $occupations = $this->accountClass->getOccupations();
        $validIds = $this->accountClass->getValidIds();
        $picabCategories = ['AAAA', 'AAA', 'AA', 'A', 'B', 'C', 'D', 'Trade/E'];
        $provinces = $this->psgcService->getProvinces();

        $existingData = $this->getExistingUserData($user->user_id, $currentRole);

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Role switch form data',
                'current_role' => $currentRole,
                'existing_data' => $existingData,
                'form_data' => [
                    'contractor_types' => $contractorTypes,
                    'occupations' => $occupations,
                    'valid_ids' => $validIds,
                    'picab_categories' => $picabCategories,
                    'provinces' => $provinces
                ],
                'is_switch_mode' => true
            ], 200);
        } else {
            return view('accounts.signup', compact(
                'contractorTypes',
                'occupations',
                'validIds',
                'picabCategories',
                'provinces',
                'currentRole',
                'existingData'
            ))->with('isSwitchMode', true);
        }
    }

    // Get existing user data
    private function getExistingUserData($userId, $currentRole)
    {
        $data = [
            'user' => DB::table('users')->where('user_id', $userId)->first(),
        ];

        if ($currentRole === 'contractor') {
            $contractor = DB::table('contractors')->where('user_id', $userId)->first();
            if ($contractor) {
                $contractorUser = DB::table('contractor_users')->where('user_id', $userId)->first();
                $data['contractor'] = $contractor;
                $data['contractor_user'] = $contractorUser;
            }
        } elseif ($currentRole === 'property_owner') {
            $owner = DB::table('property_owners')->where('user_id', $userId)->first();
            if ($owner) {
                $data['property_owner'] = $owner;
            }
        }

        return $data;
    }

    // Switch to Contractor
    public function switchContractorStep1(accountRequest $request)
    {
        if (!Session::has('user')) {
            return response()->json(['success' => false, 'errors' => ['Session expired. Please login again.']], 401);
        }

        $step1Data = Session::get('switch_contractor_step1', []);

        $step1Data = array_merge($step1Data, $request->only(['first_name','middle_name','last_name','username','company_email']));
        Session::put('switch_contractor_step1', $step1Data);

        return response()->json(['success' => true, 'message' => 'Account information saved']);
    }

    // Switch to Contractor Step 2
    public function switchContractorStep2(accountRequest $request)
    {
        if (!Session::has('user')) {
            return response()->json(['success' => false, 'errors' => ['Session expired. Please login again.']], 401);
        }

        $validated = $request->validated();

        if ($request->hasFile('dti_sec_registration_photo')) {
            $file = $request->file('dti_sec_registration_photo');
            $filename = time() . '_dti_sec_' . $file->getClientOriginalName();
            $path = $file->storeAs('contractor_documents', $filename, 'public');
            $validated['dti_sec_registration_photo'] = $path;
        }

        Session::put('switch_contractor_step2', $validated);
        return response()->json(['success' => true, 'message' => 'Documents uploaded successfully']);
    }

    // Switch to Contractor Final
    public function switchContractorFinal(accountRequest $request)
    {
        // \Log::info('Switch Contractor Final - Started');
        // \Log::info('Has user session: ' . (Session::has('user') ? 'YES' : 'NO'));
        // \Log::info('Has step1 session: ' . (Session::has('switch_contractor_step1') ? 'YES' : 'NO'));
        // \Log::info('Has step2 session: ' . (Session::has('switch_contractor_step2') ? 'YES' : 'NO'));

        // if (!Session::has('user') || !Session::has('switch_contractor_step1') || !Session::has('switch_contractor_step2')) {
        //     \Log::error('Switch Contractor Final - Session check failed');
        //     return response()->json(['success' => false, 'errors' => ['Session expired or previous steps not completed']], 401);
        // }

        $validated = $request->validated();

        $user = Session::get('user');
        $step1 = Session::get('switch_contractor_step1');
        $step2 = Session::get('switch_contractor_step2');

        \Log::info('Step1 Data: ' . json_encode($step1));
        \Log::info('Step2 Data: ' . json_encode($step2));

        try {
            DB::beginTransaction();

            if ($request->hasFile('profile_pic')) {
                $file = $request->file('profile_pic');
                $filename = time() . '_profile_' . $file->getClientOriginalName();
                $profilePicPath = $file->storeAs('profile_pictures', $filename, 'public');
                DB::table('users')->where('user_id', $user->user_id)->update(['profile_pic' => $profilePicPath]);
            }

            $businessAddress = $step1['business_address'];

            $ownerData = DB::table('property_owners')->where('user_id', $user->user_id)->first();

            $contractorId = DB::table('contractors')->insertGetId([
                'user_id' => $user->user_id,
                'company_name' => $step1['company_name'],
                'years_of_experience' => $step1['years_of_experience'],
                'type_id' => $step1['type_id'],
                'contractor_type_other' => $step1['contractor_type_other'] ?? null,
                'services_offered' => $step1['services_offered'],
                'business_address' => $businessAddress,
                'company_email' => $user->email,
                'company_phone' => $step1['company_phone'],
                'company_website' => $step1['company_website'],
                'company_social_media' => $step1['company_social_media'],
                'picab_number' => $step2['picab_number'],
                'picab_category' => $step2['picab_category'],
                'picab_expiration_date' => $step2['picab_expiration_date'],
                'business_permit_number' => $step2['business_permit_number'],
                'business_permit_city' => $step2['business_permit_city'],
                'business_permit_expiration' => $step2['business_permit_expiration'],
                'tin_business_reg_number' => $step2['tin_business_reg_number'],
                'dti_sec_registration_photo' => $step2['dti_sec_registration_photo'],
                'verification_status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('contractor_users')->insert([
                'contractor_id' => $contractorId,
                'user_id' => $user->user_id,
                'authorized_rep_lname' => $ownerData->last_name,
                'authorized_rep_mname' => $ownerData->middle_name,
                'authorized_rep_fname' => $ownerData->first_name,
                'phone_number' => $ownerData->phone_number,
                'role' => 'owner',
                'is_active' => 0,
                'created_at' => now(),
            ]);

            DB::table('users')->where('user_id', $user->user_id)->update([
                'user_type' => 'both',
                'updated_at' => now(),
            ]);

            Session::forget(['switch_contractor_step1', 'switch_contractor_step2']);
            $updatedUser = DB::table('users')->where('user_id', $user->user_id)->first();
            Session::put('user', $updatedUser);
            Session::put('userType', 'both');

            Session::put('current_role', 'contractor'); // Default to contractor since they just added contractor role

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Role switch successful! You now have both roles.', 'redirect' => '/dashboard']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'errors' => ['An error occurred: ' . $e->getMessage()]], 500);
        }
    }

    // DB calls are just laravel query builder

    // Switch to Owner Step 1 (Account Setup)
    public function switchOwnerStep1(accountRequest $request)
    {
        if (!Session::has('user')) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'errors' => ['Session expired. Please login again.']], 401);
            }
        }

        $validated = $request->validated();

        // Store account info for owner switch
        $step1Data = [
            'username' => $validated['username'],
            'email' => $validated['email']
        ];

        Session::put('switch_owner_step1', $step1Data);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Account information saved',
                'step' => 2,
                'next_step' => 'documents'
            ]);
        } else {
            return response()->json(['success' => true, 'message' => 'Account information saved']);
        }
    }

    // Switch to Owner Step 2
    public function switchOwnerStep2(accountRequest $request)
    {
        if (!Session::has('user')) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'errors' => ['Session expired. Please login again.']], 401);
            }
        }

        $validated = $request->validated();

        if ($request->hasFile('valid_id_photo')) {
            $file = $request->file('valid_id_photo');
            $filename = time() . '_valid_id_front_' . $file->getClientOriginalName();
            $path = $file->storeAs('owner_documents', $filename, 'public');
            $validated['valid_id_photo'] = $path;
        }

        if ($request->hasFile('valid_id_back_photo')) {
            $file = $request->file('valid_id_back_photo');
            $filename = time() . '_valid_id_back_' . $file->getClientOriginalName();
            $path = $file->storeAs('owner_documents', $filename, 'public');
            $validated['valid_id_back_photo'] = $path;
        }

        if ($request->hasFile('police_clearance')) {
            $file = $request->file('police_clearance');
            $filename = time() . '_police_' . $file->getClientOriginalName();
            $path = $file->storeAs('owner_documents', $filename, 'public');
            $validated['police_clearance'] = $path;
        }

        Session::put('switch_owner_step2', $validated);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Documents uploaded successfully',
                'step' => 3,
                'next_step' => 'final'
            ]);
        } else {
            return response()->json(['success' => true, 'message' => 'Documents uploaded successfully']);
        }
    }

    // Switch to Owner Final
    public function switchOwnerFinal(accountRequest $request)
    {
        if (!Session::has('user')) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'errors' => ['Session expired. Please login again.']], 401);
            }
        }

        $validated = $request->validated();
        $user = Session::get('user');

        $ownerStep1 = Session::get('owner_step1');
        $switchStep1 = Session::get('switch_owner_step1');
        $switchStep2 = Session::get('switch_owner_step2');

        if (!$ownerStep1) {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'errors' => ['Personal information missing. Please start again.']], 400);
            }
        }

        try {
            DB::beginTransaction();

            if ($request->hasFile('profile_pic')) {
                $file = $request->file('profile_pic');
                $filename = time() . '_profile_' . $file->getClientOriginalName();
                $profilePicPath = $file->storeAs('profile_pictures', $filename, 'public');
                DB::table('users')->where('user_id', $user->user_id)->update(['profile_pic' => $profilePicPath]);
            }

            // Get existing contractor user data
            $contractorUser = DB::table('contractor_users')->where('user_id', $user->user_id)->first();

            // Create property owner record using personal info from step1 and documents from step2
            DB::table('property_owners')->insert([
                'user_id' => $user->user_id,
                'last_name' => $contractorUser->authorized_rep_lname,
                'middle_name' => $contractorUser->authorized_rep_mname,
                'first_name' => $contractorUser->authorized_rep_fname,
                'phone_number' => $contractorUser->phone_number,
                'valid_id_id' => $switchStep2['valid_id_id'],
                'valid_id_back_photo' => $switchStep2['valid_id_back_photo'], // Using back photo instead of number
                'valid_id_photo' => $switchStep2['valid_id_photo'],
                'police_clearance' => $switchStep2['police_clearance'],
                'date_of_birth' => $ownerStep1['date_of_birth'],
                'age' => $ownerStep1['age'],
                'occupation_id' => $ownerStep1['occupation_id'],
                'occupation_other' => $ownerStep1['occupation_other'] ?? null,
                'address' => $ownerStep1['address'],
                'verification_status' => 'pending',
                'verification_date' => null,
                'created_at' => now(),
            ]);

            // Update user type to 'both'
            DB::table('users')->where('user_id', $user->user_id)->update([
                'user_type' => 'both',
                'updated_at' => now(),
            ]);

            // Update session with new user data
            $updatedUser = DB::table('users')->where('user_id', $user->user_id)->first();
            Session::put('user', $updatedUser);
            Session::put('userType', 'both');
            Session::put('current_role', 'owner'); // Default to owner since they just added owner role

            // Clear switch session data
            Session::forget(['switch_owner_step1', 'switch_owner_step2', 'owner_step1']);

            DB::commit();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Role switch successful! You now have both roles.',
                    'user_type' => 'both',
                    'current_role' => 'owner',
                    'redirect_url' => '/dashboard'
                ], 201);
            } else {
                return response()->json(['success' => true, 'message' => 'Role switch successful! You now have both roles.', 'redirect' => '/dashboard']);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred during role switch',
                    'errors' => [$e->getMessage()]
                ], 500);
            } else {
                return response()->json(['success' => false, 'errors' => ['An error occurred: ' . $e->getMessage()]], 500);
            }
        }
    }

    // PSGC API Endpoints

    public function getProvinces()
    {
        $provinces = $this->psgcService->getProvinces();
        return response()->json($provinces);
    }

    public function getCitiesByProvince($provinceCode)
    {
        $cities = $this->psgcService->getCitiesByProvince($provinceCode);
        return response()->json($cities);
    }

    public function getBarangaysByCity($cityCode)
    {
        $barangays = $this->psgcService->getBarangaysByCity($cityCode);
        return response()->json($barangays);
    }

    // API Methods for Mobile Authentication

    // API Login
    public function apiLogin(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            $result = $this->authService->login($request->email, $request->password);

            if ($result['success']) {
                $user = $result['user'];
                // Create Sanctum token for mobile app
                $token = $user->createToken('mobile-app')->plainTextToken;
                
                return response()->json([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $user,
                    'userType' => $result['userType'],
                    'token' => $token
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 401);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during login'
            ], 500);
        }
    }

    // API Register
    public function apiRegister(Request $request)
    {
        try {
            // First, let's see what data we're receiving
            \Illuminate\Support\Facades\Log::info('Registration attempt with data: ', $request->all());

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6'
            ]);

            // Generate a simple OTP hash for now
            $otpHash = bcrypt('123456'); // You can implement proper OTP generation later

            // Create user using your database structure
            $user = \App\Models\User::create([
                'username' => $request->name,
                'email' => $request->email,
                'password_hash' => bcrypt($request->password),
                'OTP_hash' => $otpHash,
                'user_type' => 'property_owner', // Default to property_owner for mobile registration
                'is_verified' => 0, // Not verified initially
                'is_active' => 1 // Active by default
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user' => [
                    'id' => $user->user_id,
                    'name' => $user->username,
                    'email' => $user->email,
                    'user_type' => $user->user_type
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Log the actual error for debugging
            \Illuminate\Support\Facades\Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during registration: ' . $e->getMessage(),
                'debug' => [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    // API Test Connection
    public function apiTest()
    {
        return response()->json([
            'success' => true,
            'message' => 'API connection successful',
            'timestamp' => now(),
            'server' => 'Laravel ' . app()->version()
        ], 200);
    }
}
