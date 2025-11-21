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

Route::get('/dashboard', [\App\Http\Controllers\Owner\projectsController::class, 'showDashboard']);

// Contractor Milestone Setup Routes
Route::get('/contractor/milestone/setup', [cprocessController::class, 'showMilestoneSetupForm']);
Route::post('/contractor/milestone/setup/step1', [cprocessController::class, 'milestoneStepOne']);
Route::post('/contractor/milestone/setup/step2', [cprocessController::class, 'milestoneStepTwo']);
Route::post('/contractor/milestone/setup/submit', [cprocessController::class, 'submitMilestone']);
Route::post('/contractor/milestone/{milestoneId}/delete', [cprocessController::class, 'deleteMilestone']);

// Role Management Routes for 'both' users
Route::post('/api/role/switch', [cprocessController::class, 'switchRole']);
Route::get('/api/role/current', [cprocessController::class, 'getCurrentRole']);

// Dispute Routes
Route::get('/both/disputes', [disputeController::class, 'showDisputePage']);
Route::post('/both/disputes/file', [disputeController::class, 'fileDispute']);
Route::get('/both/disputes/list', [disputeController::class, 'getDisputes']);
Route::get('/both/disputes/{disputeId}', [disputeController::class, 'getDisputeDetails']);
Route::put('/both/disputes/{disputeId}', [disputeController::class, 'updateDispute']);
Route::post('/both/disputes/{disputeId}/cancel', [disputeController::class, 'cancelDispute']);
Route::delete('/both/disputes/evidence/{fileId}', [disputeController::class, 'deleteEvidenceFile']);
Route::get('/both/disputes/milestones/{projectId}', [disputeController::class, 'getMilestones']);
Route::get('/both/disputes/milestone-items/{milestoneId}', [disputeController::class, 'getMilestoneItems']);
Route::post('/both/disputes/check-existing', [disputeController::class, 'checkExistingDispute']);

// Projects Routes
Route::get('/both/projects', [disputeController::class, 'showProjectsPage']);
Route::get('/both/projects/{projectId}', [disputeController::class, 'showProjectDetails']);

// Contractor Progress Upload Routes
Route::get('/contractor/progress/upload', [\App\Http\Controllers\contractor\progressUploadController::class, 'showUploadPage']);
Route::post('/contractor/progress/upload', [\App\Http\Controllers\contractor\progressUploadController::class, 'uploadProgress']);
Route::get('/contractor/progress/files/{itemId}', [\App\Http\Controllers\contractor\progressUploadController::class, 'getProgressFiles']);
Route::put('/contractor/progress/{progressId}', [\App\Http\Controllers\contractor\progressUploadController::class, 'updateProgress']);
Route::delete('/contractor/progress/{progressId}', [\App\Http\Controllers\contractor\progressUploadController::class, 'deleteProgress']);
// Owner payment validation routes
Route::post('/owner/payment/upload', [\App\Http\Controllers\owner\paymentUploadController::class, 'uploadPayment']);
Route::put('/owner/payment/{paymentId}', [\App\Http\Controllers\owner\paymentUploadController::class, 'updatePayment']);
Route::delete('/owner/payment/{paymentId}', [\App\Http\Controllers\owner\paymentUploadController::class, 'deletePayment']);
Route::post('/contractor/progress/approve/{progressId}', [\App\Http\Controllers\contractor\progressUploadController::class, 'approveProgress']);

// Owner Project Posting Routes
Route::get('/owner/projects/create', [\App\Http\Controllers\Owner\projectsController::class, 'showCreatePostPage']);
Route::post('/owner/projects', [\App\Http\Controllers\Owner\projectsController::class, 'store']);
Route::get('/owner/projects/{projectId}/edit', [\App\Http\Controllers\Owner\projectsController::class, 'showEditPostPage']);
Route::put('/owner/projects/{projectId}', [\App\Http\Controllers\Owner\projectsController::class, 'update']);
Route::delete('/owner/projects/{projectId}', [\App\Http\Controllers\Owner\projectsController::class, 'delete']);
Route::post('/owner/projects/{projectId}/bids/{bidId}/accept', [\App\Http\Controllers\Owner\projectsController::class, 'acceptBid']);
Route::post('/owner/milestones/{milestoneId}/approve', [disputeController::class, 'approveMilestone']);
Route::post('/owner/milestones/{milestoneId}/reject', [disputeController::class, 'rejectMilestone']);
Route::post('/contractor/payments/{paymentId}/approve', [disputeController::class, 'approvePayment']);

// Contractor Bidding Routes
Route::get('/contractor/projects/{projectId}', [\App\Http\Controllers\contractor\biddingController::class, 'showProjectOverview']);
Route::post('/contractor/bids', [\App\Http\Controllers\contractor\biddingController::class, 'store']);
Route::put('/contractor/bids/{bidId}', [\App\Http\Controllers\contractor\biddingController::class, 'update']);
Route::post('/contractor/bids/{bidId}/cancel', [\App\Http\Controllers\contractor\biddingController::class, 'cancel']);




