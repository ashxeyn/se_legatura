<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\authController;

// Test endpoint for mobile app
Route::get('/test', [authController::class, 'apiTest']);

// Authentication routes (no CSRF protection)
Route::post('/login', [authController::class, 'apiLogin']);
Route::post('/register', [authController::class, 'apiRegister']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Additional protected endpoints can be added here
});
