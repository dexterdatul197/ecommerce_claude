<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@ecommerce.com'],
            [
                'name'     => 'Admin',
                'password' => 'password',
                'role'     => 'admin',
                'is_active'=> true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'customer@ecommerce.com'],
            [
                'name'     => 'Test Customer',
                'password' => 'password',
                'role'     => 'customer',
                'is_active'=> true,
            ]
        );

        $this->command->info('Admin: admin@ecommerce.com / password');
        $this->command->info('Customer: customer@ecommerce.com / password');
    }
}
