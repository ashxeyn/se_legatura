<?php

namespace App\Http\Requests\Accounts;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class accountRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $data = [];

        if ($this->has('first_name') && $this->first_name) {
            $data['first_name'] = ucwords(strtolower(trim($this->first_name)));
        }

        if ($this->has('middle_name') && $this->middle_name) {
            $data['middle_name'] = ucwords(strtolower(trim($this->middle_name)));
        }

        if ($this->has('last_name') && $this->last_name) {
            $data['last_name'] = ucwords(strtolower(trim($this->last_name)));
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }

    public function rules()
    {
        $action = $this->route()->getActionMethod();

        switch ($action) {
            case 'login':
                return $this->loginRules();
            case 'contractorStep1':
                return $this->contractorStep1Rules();
            case 'contractorStep2':
                return $this->contractorStep2Rules();
            case 'contractorVerifyOtp':
                return $this->otpRules();
            case 'contractorStep4':
                return $this->contractorStep4Rules();
            case 'contractorFinalStep':
                return $this->contractorFinalRules();
            case 'propertyOwnerStep1':
                return $this->ownerStep1Rules();
            case 'propertyOwnerStep2':
                return $this->ownerStep2Rules();
            case 'propertyOwnerVerifyOtp':
                return $this->otpRules();
            case 'propertyOwnerStep4':
                return $this->ownerStep4Rules();
            case 'propertyOwnerFinalStep':
                return $this->ownerFinalRules();
            case 'switchContractorStep1':
                return $this->switchContractorStep1Rules();
            case 'switchContractorStep2':
                return $this->switchContractorStep2Rules();
            case 'switchContractorFinal':
                return $this->switchContractorFinalRules();
            case 'switchOwnerStep1':
                return $this->switchOwnerStep1Rules();
            case 'switchOwnerStep2':
                return $this->switchOwnerStep2Rules();
            case 'switchOwnerFinal':
                return $this->switchOwnerFinalRules();
            default:
                return [];
        }
    }

    protected function loginRules()
    {
        return [
            'username' => 'required|string',
            'password' => 'required|string'
        ];
    }

    protected function contractorStep1Rules()
    {
        return [
            'company_name' => 'required|string|max:255',
            'company_phone' => [
                'required',
                'string',
                'regex:/^09[0-9]{9}$/'
            ],
            'years_of_experience' => 'required|integer|min:0',
            'contractor_type_id' => 'required|integer',
            'contractor_type_other_text' => 'nullable|string|max:255',
            'services_offered' => 'required|string',
            'business_address_street' => 'required|string|max:255',
            'business_address_barangay' => 'required|string|max:255',
            'business_address_city' => 'required|string|max:255',
            'business_address_province' => 'required|string|max:255',
            'business_address_postal' => 'required|string|max:10',
            'company_website' => 'nullable|url|max:255',
            'company_social_media' => 'nullable|string|max:255'
        ];
    }

    protected function contractorStep2Rules()
    {
        return [
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'company_email' => 'required|email|max:255|unique:users,email|unique:contractors,company_email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/',
                'confirmed'
            ]
        ];
    }

    protected function otpRules()
    {
        return [
            'otp' => 'required|string|size:6'
        ];
    }

    protected function contractorStep4Rules()
    {
        return [
            'picab_number' => 'required|string|max:50',
            'picab_category' => 'required|string|in:AAAA,AAA,AA,A,B,C,D,Trade/E',
            'picab_expiration_date' => [
                'required',
                'date',
                'after:today'
            ],
            'business_permit_number' => 'required|string|max:50',
            'business_permit_city' => 'required|string|max:255',
            'business_permit_expiration' => [
                'required',
                'date',
                'after:today'
            ],
            'tin_business_reg_number' => 'required|string|max:50',
            'dti_sec_registration_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ];
    }

    protected function contractorFinalRules()
    {
        return [
            'profile_pic' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ];
    }

    protected function ownerStep1Rules()
    {
        return [
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'date_of_birth' => [
                'required',
                'date',
                'before:today'
            ],
            'phone_number' => [
                'required',
                'string',
                'regex:/^09[0-9]{9}$/'
            ],
            'occupation_id' => 'required|integer',
            'occupation_other_text' => 'nullable|string|max:255',
            'owner_address_street' => 'required|string|max:255',
            'owner_address_barangay' => 'required|string|max:255',
            'owner_address_city' => 'required|string|max:255',
            'owner_address_province' => 'required|string|max:255',
            'owner_address_postal' => 'required|string|max:10'
        ];
    }

    protected function ownerStep2Rules()
    {
        return [
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/',
                'confirmed'
            ]
        ];
    }

    protected function ownerStep4Rules()
    {
        return [
            'valid_id_id' => 'required|integer',
            'valid_id_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'valid_id_back_photo' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'police_clearance' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ];
    }

    protected function ownerFinalRules()
    {
        return [
            'profile_pic' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ];
    }

    protected function switchContractorStep1Rules()
    {
        return [
            'first_name' => 'nullable|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'username' => 'nullable|string|max:50',
            'company_email' => 'nullable|email|max:255'
        ];
    }

    protected function switchContractorStep2Rules()
    {
        return [
            'picab_number' => 'required|string|max:50',
            'picab_category' => 'required|string|in:AAAA,AAA,AA,A,B,C,D,Trade/E',
            'picab_expiration_date' => [
                'required',
                'date',
                'after:today'
            ],
            'business_permit_number' => 'required|string|max:50',
            'business_permit_city' => 'required|string|max:255',
            'business_permit_expiration' => [
                'required',
                'date',
                'after:today'
            ],
            'tin_business_reg_number' => 'required|string|max:50',
            'dti_sec_registration_photo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ];
    }

    protected function switchContractorFinalRules()
    {
        return [
            'profile_pic' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ];
    }

    protected function switchOwnerStep1Rules()
    {
        return [
            'username' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255'
        ];
    }

    protected function switchOwnerStep2Rules()
    {
        return [
            'valid_id_id' => 'required|integer',
            'valid_id_photo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'valid_id_back_photo' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'police_clearance' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ];
    }

    protected function switchOwnerFinalRules()
    {
        return [
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'date_of_birth' => [
                'required',
                'date',
                'before:today'
            ],
            'phone_number' => [
                'required',
                'string',
                'regex:/^09[0-9]{9}$/'
            ],
            'occupation_id' => 'required|integer',
            'occupation_other' => 'nullable|string|max:255',
            'address' => 'required|string|max:500',
            'profile_pic' => 'nullable|file|mimes:jpg,jpeg,png|max:5120'
        ];
    }

    public function messages()
    {
        return [
            'company_phone.regex' => 'Phone number must be 11 digits starting with 09 (e.g., 09171234567)',
            'phone_number.regex' => 'Phone number must be 11 digits starting with 09 (e.g., 09171234567)',
            'password.min' => 'Password must be at least 8 characters',
            'password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character',
            'picab_expiration_date.after' => 'PICAB expiration date must be in the future',
            'business_permit_expiration.after' => 'Business permit expiration date must be in the future',
            'date_of_birth.before' => 'Please enter a valid date of birth',
            'dti_sec_registration_photo.max' => 'File size must not exceed 5MB',
            'valid_id_photo.max' => 'File size must not exceed 5MB',
            'police_clearance.max' => 'File size must not exceed 5MB',
            'profile_pic.max' => 'File size must not exceed 5MB'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'errors' => $validator->errors()->all()
            ], 422)
        );
    }
}
