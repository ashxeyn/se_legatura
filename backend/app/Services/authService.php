<?php

namespace App\Services;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class authService
{
    // Generate a 6-digit OTP
    public function generateOtp()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function hashOtp($otp)
    {
        return Hash::make($otp);
    }

    public function verifyOtp($inputOtp, $hashedOtp)
    {
        return Hash::check($inputOtp, $hashedOtp);
    }

    public function hashPassword($password)
    {
        return Hash::make($password);
    }

    public function verifyPassword($inputPassword, $hashedPassword)
    {
        return Hash::check($inputPassword, $hashedPassword);
    }

    public function sendOtpEmail($email, $otp)
    {
        // \Log::info("OTP for {$email}: {$otp}");

        try {
            \Mail::raw("Your OTP code is: {$otp}\n\nThis code will expire soon. Please do not share this code with anyone.", function($message) use ($email) {
                $message->to($email)
                        ->subject('Legatura - Your OTP Code');
            });
            return true;
        } catch (\Exception $e) {
            \Log::error("Failed to send OTP email to {$email}: " . $e->getMessage());
            return false;
        }
    }

    public function attemptUserLogin($username, $password)
    {
        $user = DB::table('users')
            ->where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if ($user && $this->verifyPassword($password, $user->password_hash)) {
            if (!$user->is_verified) {
                return [
                    'success' => false,
                    'message' => 'Your account is waiting for verification. Please wait for admin approval.'
                ];
            }

            if (!$user->is_active) {
                return [
                    'success' => false,
                    'message' => 'Account is inactive. Please contact support.'
                ];
            }

            return [
                'success' => true,
                'user' => $user,
                'userType' => 'user'
            ];
        }

        return [
            'success' => false,
            'message' => 'Invalid credentials'
        ];
    }

    public function attemptAdminLogin($username, $password)
    {
        $admin = DB::table('admin_users')
            ->where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if ($admin && $this->verifyPassword($password, $admin->password_hash)) {
            if ($admin->is_active) {
                return [
                    'success' => true,
                    'user' => $admin,
                    'userType' => 'admin'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Admin account is inactive'
                ];
            }
        }

        return [
            'success' => false,
            'message' => 'Invalid credentials'
        ];
    }

    public function login($username, $password)
    {
        $userLogin = $this->attemptUserLogin($username, $password);
        if ($userLogin['success']) {
            return $userLogin;
        }

        $user = DB::table('users')
            ->where('username', $username)
            ->orWhere('email', $username)
            ->first();

        if ($user) {
            return $userLogin;
        }

        $adminLogin = $this->attemptAdminLogin($username, $password);
        if ($adminLogin['success']) {
            return $adminLogin;
        }

        return [
            'success' => false,
            'message' => 'Invalid username or password'
        ];
    }

    public function validatePasswordStrength($password)
    {
        if (strlen($password) < 8) {
            return [
                'valid' => false,
                'message' => 'Password must be at least 8 characters'
            ];
        }

        if (!preg_match('/[A-Z]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one uppercase letter'
            ];
        }

        if (!preg_match('/[0-9]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one number'
            ];
        }

        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            return [
                'valid' => false,
                'message' => 'Password must contain at least one special character'
            ];
        }

        return ['valid' => true];
    }

    public function calculateAge($dateOfBirth)
    {
        $dob = new \DateTime($dateOfBirth);
        $now = new \DateTime();
        $age = $now->diff($dob)->y;
        return $age;
    }
}
