<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class adminUserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('admin_users')->insert([
            'username' => 'admin123',
            'email' => 'admin@gmail.com',
            'password_hash' => Hash::make('Admin123@!'),
            'last_name' => 'admin',
            'middle_name' => 'admin',
            'first_name' => 'admin',
            'is_active' => 1,
            'created_at' => now()
        ]);

        // echo "Admin user created successfully!\n";
        // echo "Username: admin123\n";
        // echo "Email: admin@gmail.com\n";
        // echo "Password: Admin123@!\n";
    }
}
