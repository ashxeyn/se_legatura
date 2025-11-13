<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\authController;
use App\Http\Controllers\contractor\cprocessController;
use App\Http\Controllers\both\disputeController;

Route::get('/', function () {
    return view('startPoint');
});

// Authentication Routes
Route::get('/accounts/login', [authController::class, 'showLoginForm']);
Route::post('/accounts/login', [authController::class, 'login']);
Route::get('/accounts/signup', [authController::class, 'showSignupForm']);
Route::post('/accounts/logout', [authController::class, 'logout']);
Route::get('/accounts/logout', [authController::class, 'logout']);

// Contractor Signup Routes
Route::post('/accounts/signup/contractor/step1', [authController::class, 'contractorStep1']);
Route::post('/accounts/signup/contractor/step2', [authController::class, 'contractorStep2']);
Route::post('/accounts/signup/contractor/step3/verify-otp', [authController::class, 'contractorVerifyOtp']);
Route::post('/accounts/signup/contractor/step4', [authController::class, 'contractorStep4']);
Route::post('/accounts/signup/contractor/final', [authController::class, 'contractorFinalStep']);

// Property Owner Signup Routes
Route::post('/accounts/signup/owner/step1', [authController::class, 'propertyOwnerStep1']);
Route::post('/accounts/signup/owner/step2', [authController::class, 'propertyOwnerStep2']);
Route::post('/accounts/signup/owner/step3/verify-otp', [authController::class, 'propertyOwnerVerifyOtp']);
Route::post('/accounts/signup/owner/step4', [authController::class, 'propertyOwnerStep4']);
Route::post('/accounts/signup/owner/final', [authController::class, 'propertyOwnerFinalStep']);

// Role Switch Routes
Route::get('/accounts/switch', [authController::class, 'showSwitchForm']);
Route::post('/accounts/switch/contractor/step1', [authController::class, 'switchContractorStep1']);
Route::post('/accounts/switch/contractor/step2', [authController::class, 'switchContractorStep2']);
Route::post('/accounts/switch/contractor/final', [authController::class, 'switchContractorFinal']);
Route::post('/accounts/switch/owner/step1', [authController::class, 'switchOwnerStep1']);
Route::post('/accounts/switch/owner/step2', [authController::class, 'switchOwnerStep2']);
Route::post('/accounts/switch/owner/final', [authController::class, 'switchOwnerFinal']);

// PSGC API Routes
Route::get('/api/psgc/provinces', [authController::class, 'getProvinces']);
Route::get('/api/psgc/provinces/{provinceCode}/cities', [authController::class, 'getCitiesByProvince']);
Route::get('/api/psgc/cities/{cityCode}/barangays', [authController::class, 'getBarangaysByCity']);

// Dashboard Routes
Route::get('/admin/dashboard', function() {
    return view('admin.dashboard');
});

Route::get('/dashboard', function() {
    return view('both.dashboard');
});

// Contractor Milestone Setup Routes
Route::get('/contractor/milestone/setup', [cprocessController::class, 'showMilestoneSetupForm']);
Route::post('/contractor/milestone/setup/step1', [cprocessController::class, 'milestoneStepOne']);
Route::post('/contractor/milestone/setup/step2', [cprocessController::class, 'milestoneStepTwo']);
Route::post('/contractor/milestone/setup/submit', [cprocessController::class, 'submitMilestone']);

// Role Management Routes for 'both' users
Route::post('/api/role/switch', [cprocessController::class, 'switchRole']);
Route::get('/api/role/current', [cprocessController::class, 'getCurrentRole']);

// Dispute Routes
Route::get('/both/disputes', [disputeController::class, 'showDisputePage']);
Route::post('/both/disputes/file', [disputeController::class, 'fileDispute']);
Route::get('/both/disputes/list', [disputeController::class, 'getDisputes']);
Route::get('/both/disputes/{disputeId}', [disputeController::class, 'getDisputeDetails']);
Route::get('/both/disputes/milestones/{projectId}', [disputeController::class, 'getMilestones']);

// Projects Routes
Route::get('/both/projects', [disputeController::class, 'showProjectsPage']);
Route::get('/both/projects/{projectId}', [disputeController::class, 'showProjectDetails']);


