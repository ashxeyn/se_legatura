<?php

namespace App\Models\accounts;

use Illuminate\Support\Facades\DB;

class accountClass
{
    public function getContractorTypes()
    {
        return DB::table('contractor_types')
            ->orderByRaw("CASE WHEN LOWER(type_name) = 'others' THEN 1 ELSE 0 END, type_name ASC")
            ->get();
    }

    public function getOccupations()
    {
        return DB::table('occupations')
            ->orderByRaw("CASE WHEN LOWER(occupation_name) = 'others' THEN 1 ELSE 0 END, occupation_name ASC")
            ->get();
    }

    public function getValidIds()
    {
        return DB::table('valid_ids')->orderBy('valid_id_name', 'asc')->get();
    }

    public function getPicabCategories()
    {
        $result = DB::select("SHOW COLUMNS FROM contractors WHERE Field = 'picab_category'");
        if (empty($result)) {
            return [];
        }

        $type = $result[0]->Type;
        preg_match('/^enum\((.*)\)$/', $type, $matches);

        if (empty($matches[1])) {
            return [];
        }

        $values = str_getcsv($matches[1], ',', "'");
        return $values;
    }

    public function usernameExists($username)
    {
        $userExists = DB::table('users')->where('username', $username)->exists();
        $adminExists = DB::table('admin_users')->where('username', $username)->exists();
        return $userExists || $adminExists;
    }

    public function emailExists($email)
    {
        $userExists = DB::table('users')->where('email', $email)->exists();
        $adminExists = DB::table('admin_users')->where('email', $email)->exists();
        return $userExists || $adminExists;
    }

    public function companyEmailExists($companyEmail)
    {
        return DB::table('contractors')->where('company_email', $companyEmail)->exists();
    }

    public function createUser($data)
    {
        $userId = DB::table('users')->insertGetId([
            'profile_pic' => $data['profile_pic'] ?? null,
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'OTP_hash' => $data['OTP_hash'],
            'user_type' => $data['user_type'],
            'is_verified' => 0,
            'is_active' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return $userId;
    }

    public function createContractor($data)
    {
        $contractorId = DB::table('contractors')->insertGetId([
            'user_id' => $data['user_id'],
            'company_name' => $data['company_name'],
            'years_of_experience' => $data['years_of_experience'],
            'type_id' => $data['type_id'],
            'contractor_type_other' => $data['contractor_type_other'] ?? null,
            'services_offered' => $data['services_offered'],
            'business_address' => $data['business_address'],
            'company_email' => $data['company_email'],
            'company_phone' => $data['company_phone'],
            'company_website' => $data['company_website'] ?? null,
            'company_social_media' => $data['company_social_media'] ?? null,
            'picab_number' => $data['picab_number'],
            'picab_category' => $data['picab_category'],
            'picab_expiration_date' => $data['picab_expiration_date'],
            'business_permit_number' => $data['business_permit_number'],
            'business_permit_city' => $data['business_permit_city'],
            'business_permit_expiration' => $data['business_permit_expiration'],
            'tin_business_reg_number' => $data['tin_business_reg_number'],
            'dti_sec_registration_photo' => $data['dti_sec_registration_photo'],
            'verification_status' => 'pending',
            'verification_date' => null,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return $contractorId;
    }

    public function createContractorUser($data)
    {
        $contractorUserId = DB::table('contractor_users')->insertGetId([
            'contractor_id' => $data['contractor_id'],
            'user_id' => $data['user_id'],
            'authorized_rep_lname' => $data['last_name'],
            'authorized_rep_mname' => $data['middle_name'] ?? null,
            'authorized_rep_fname' => $data['first_name'],
            'phone_number' => $data['phone_number'] ?? '',
            'role' => 'owner',
            'is_active' => 0,
            'created_at' => now()
        ]);

        return $contractorUserId;
    }

    public function createPropertyOwner($data)
    {
        $ownerId = DB::table('property_owners')->insertGetId([
            'user_id' => $data['user_id'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'first_name' => $data['first_name'],
            'phone_number' => $data['phone_number'],
            'valid_id_id' => $data['valid_id_id'],
            'valid_id_photo' => $data['valid_id_photo'] ?? null,
            'valid_id_back_photo' => $data['valid_id_back_photo'] ?? null,
            'police_clearance' => $data['police_clearance'] ?? null,
            'date_of_birth' => $data['date_of_birth'],
            'age' => $data['age'],
            'occupation_id' => $data['occupation_id'],
            'occupation_other' => $data['occupation_other'] ?? null,
            'address' => $data['address'] ?? null,
            'verification_status' => 'pending',
            'verification_date' => null,
            'created_at' => now()
        ]);

        return $ownerId;
    }

    public function getUserById($userId)
    {
        return DB::table('users')->where('user_id', $userId)->first();
    }

    public function getContractorByUserId($userId)
    {
        return DB::table('contractors')->where('user_id', $userId)->first();
    }

    public function getPropertyOwnerByUserId($userId)
    {
        return DB::table('property_owners')->where('user_id', $userId)->first();
    }

    public function updateUserProfilePic($userId, $profilePicPath)
    {
        return DB::table('users')
            ->where('user_id', $userId)
            ->update(['profile_pic' => $profilePicPath]);
    }

    public function updateOtpHash($userId, $otpHash)
    {
        return DB::table('users')
            ->where('user_id', $userId)
            ->update(['OTP_hash' => $otpHash]);
    }

    public function verifyUser($userId)
    {
        return DB::table('users')
            ->where('user_id', $userId)
            ->update(['is_verified' => 1]);
    }

    public function createAdminUser($data)
    {
        $adminId = DB::table('admin_users')->insertGetId([
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => $data['password_hash'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'first_name' => $data['first_name'],
            'is_active' => 0,
            'created_at' => now()
        ]);

        return $adminId;
    }
}
