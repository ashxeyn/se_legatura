<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\authController;
use App\Http\Controllers\owner\projectsController;
use App\Http\Controllers\contractor\cprocessController;
use App\Http\Controllers\contractor\biddingController;
use App\Http\Controllers\contractor\progressUploadController;
use App\Http\Controllers\owner\paymentUploadController;
use App\Http\Controllers\both\disputeController;

// Test endpoint for mobile app
Route::get('/test', [authController::class, 'apiTest']);

// Signup form data endpoint for mobile app
Route::get('/signup-form', [authController::class, 'showSignupForm']);

// Public routes (no authentication required)
Route::post('/login', [authController::class, 'apiLogin']);
Route::post('/register', [authController::class, 'apiRegister']);

// PSGC API Routes (public)
Route::get('/psgc/provinces', [authController::class, 'getProvinces']);
Route::get('/psgc/provinces/{provinceCode}/cities', [authController::class, 'getCitiesByProvince']);
Route::get('/psgc/cities/{cityCode}/barangays', [authController::class, 'getBarangaysByCity']);

// Protected routes (require authentication via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // User information
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
                'userType' => $request->user()->user_type ?? null
            ]
        ]);
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    });

    // Role management
    Route::post('/role/switch', [cprocessController::class, 'switchRole']);
    Route::get('/role/current', [cprocessController::class, 'getCurrentRole']);

    // Dashboard
    Route::get('/dashboard', [projectsController::class, 'showDashboard']);

    // Projects (Owner)
    Route::prefix('projects')->group(function () {
        Route::get('/', [projectsController::class, 'index']);
        Route::get('/{id}', [disputeController::class, 'showProjectDetails']);
        Route::post('/', [projectsController::class, 'store']);
        Route::put('/{id}', [projectsController::class, 'update']);
        Route::delete('/{id}', [projectsController::class, 'destroy']);
        
        // Project bids
        Route::get('/{id}/bids', [biddingController::class, 'getProjectBids']);
        Route::post('/{id}/bids', [biddingController::class, 'store']);
        Route::post('/{id}/bids/{bidId}/accept', [biddingController::class, 'acceptBid']);
    });

    // Milestones (Contractor)
    Route::prefix('milestones')->group(function () {
        Route::get('/', [cprocessController::class, 'getMilestones']);
        Route::get('/{id}', [cprocessController::class, 'getMilestoneDetails']);
        Route::post('/', [cprocessController::class, 'submitMilestone']);
        Route::put('/{id}', [cprocessController::class, 'updateMilestone']);
        Route::delete('/{id}', [cprocessController::class, 'deleteMilestone']);
        
        // Milestone approval (Owner)
        Route::post('/{id}/approve', [disputeController::class, 'approveMilestone']);
        Route::post('/{id}/reject', [disputeController::class, 'rejectMilestone']);
    });

    // Milestone setup (Contractor)
    Route::prefix('milestone')->group(function () {
        Route::get('/setup', [cprocessController::class, 'showMilestoneSetupForm']);
        Route::post('/setup/step1', [cprocessController::class, 'milestoneStepOne']);
        Route::post('/setup/step2', [cprocessController::class, 'milestoneStepTwo']);
        Route::post('/setup/submit', [cprocessController::class, 'submitMilestone']);
    });

    // Bids (Contractor)
    Route::prefix('bids')->group(function () {
        Route::get('/', [biddingController::class, 'index']);
        Route::get('/{id}', [biddingController::class, 'show']);
        Route::post('/', [biddingController::class, 'store']);
        Route::put('/{id}', [biddingController::class, 'update']);
        Route::post('/{id}/cancel', [biddingController::class, 'cancelBid']);
    });

    // Progress Reports (Contractor)
    Route::prefix('progress')->group(function () {
        Route::get('/', [progressUploadController::class, 'index']);
        Route::get('/{id}', [progressUploadController::class, 'show']);
        Route::post('/', [progressUploadController::class, 'store']);
        Route::put('/{id}', [progressUploadController::class, 'update']);
        Route::delete('/{id}', [progressUploadController::class, 'destroy']);
        Route::post('/{id}/approve', [progressUploadController::class, 'approveProgress']);
        Route::post('/{id}/reject', [progressUploadController::class, 'rejectProgress']);
        
        // Progress files
        Route::post('/files', [progressUploadController::class, 'uploadFiles']);
        Route::delete('/files/{id}', [progressUploadController::class, 'deleteFile']);
    });

    // Payment Validations (Owner)
    Route::prefix('payments')->group(function () {
        Route::get('/', [paymentUploadController::class, 'index']);
        Route::get('/{id}', [paymentUploadController::class, 'show']);
        Route::post('/', [paymentUploadController::class, 'store']);
        Route::put('/{id}', [paymentUploadController::class, 'update']);
        Route::delete('/{id}', [paymentUploadController::class, 'destroy']);
        Route::post('/{id}/approve', [disputeController::class, 'approvePayment']);
    });

    // Disputes (Both)
    Route::prefix('disputes')->group(function () {
        Route::get('/', [disputeController::class, 'getDisputes']);
        Route::get('/{id}', [disputeController::class, 'getDisputeDetails']);
        Route::post('/', [disputeController::class, 'fileDispute']);
        Route::put('/{id}', [disputeController::class, 'updateDispute']);
        Route::delete('/{id}', [disputeController::class, 'cancelDispute']);
    });

    // Projects list (Both)
    Route::get('/projects', [disputeController::class, 'showProjectsPage']);
});
