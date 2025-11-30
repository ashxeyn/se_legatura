<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

abstract class BaseApiController extends Controller
{
    /**
     * Return a success JSON response
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return an error JSON response
     */
    protected function errorResponse(string $message, $errors = null, int $statusCode = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = is_array($errors) ? $errors : [$errors];
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a validation error JSON response
     */
    protected function validationErrorResponse($errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422);
    }

    /**
     * Get authenticated user (works with both Session and Sanctum)
     */
    protected function getAuthenticatedUser(Request $request)
    {
        // Try Sanctum first (for API requests)
        if ($request->user()) {
            return $request->user();
        }

        // Fallback to Session (for web requests)
        return session('user');
    }

    /**
     * Check if request is from API (mobile app)
     */
    protected function isApiRequest(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }
}








