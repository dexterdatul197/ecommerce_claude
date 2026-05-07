<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
            return $frontend.'/auth/reset-password?token='.urlencode($token).'&email='.urlencode($user->email);
        });
    }
}
