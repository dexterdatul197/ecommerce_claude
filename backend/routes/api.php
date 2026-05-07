<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\Admin;
use Illuminate\Support\Facades\Route;

// ── Stripe Webhook (no auth) ──────────────────────────────
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

// ── Public ────────────────────────────────────────────────
Route::post('/auth/register',         [AuthController::class, 'register']);
Route::post('/auth/login',            [AuthController::class, 'login']);
Route::post('/auth/forgot-password',  [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/reset-password',   [PasswordResetController::class, 'resetPassword']);

Route::get('/categories',        [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products',              [ProductController::class, 'index']);
Route::get('/products/search',       [ProductController::class, 'search']);
Route::get('/products/{slug}',       [ProductController::class, 'show']);
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

// ── Authenticated ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::put('/auth/profile',  [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Cart
    Route::get('/cart',           [CartController::class, 'index']);
    Route::post('/cart',          [CartController::class, 'store']);
    Route::put('/cart/{id}',      [CartController::class, 'update']);
    Route::delete('/cart/{id}',   [CartController::class, 'destroy']);
    Route::delete('/cart',        [CartController::class, 'clear']);

    // Orders
    Route::get('/orders',              [OrderController::class, 'index']);
    Route::post('/orders',             [OrderController::class, 'store']);
    Route::get('/orders/{id}',         [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Payments
    Route::post('/payments/intent',         [OrderController::class, 'createPaymentIntent']);
    Route::post('/payments/confirm/{orderId}', [OrderController::class, 'confirmPayment']);

    // Addresses
    Route::apiResource('addresses', AddressController::class);
    Route::put('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    // Coupons
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    // Reviews
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    // Wishlist
    Route::get('/wishlist',             [WishlistController::class, 'index']);
    Route::post('/wishlist/{productId}', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
});

// ── Admin ──────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [Admin\DashboardController::class, 'index']);
    Route::get('/badges',   [Admin\DashboardController::class, 'badges']);

    // Categories
    Route::apiResource('categories', Admin\CategoryController::class);

    // Products
    Route::apiResource('products', Admin\ProductController::class);
    Route::post('/products/{id}/images',                 [Admin\ProductController::class, 'uploadImages']);
    Route::delete('/products/{id}/images/{imageId}',     [Admin\ProductController::class, 'deleteImage']);

    // Orders
    Route::get('/orders',                   [Admin\OrderController::class, 'index']);
    Route::put('/orders/bulk-status',       [Admin\OrderController::class, 'bulkUpdateStatus']);
    Route::get('/orders/{id}',              [Admin\OrderController::class, 'show']);
    Route::put('/orders/{id}/status',       [Admin\OrderController::class, 'updateStatus']);

    // Customers
    Route::get('/customers',               [Admin\CustomerController::class, 'index']);
    Route::get('/customers/{id}',          [Admin\CustomerController::class, 'show']);
    Route::put('/customers/{id}/toggle',   [Admin\CustomerController::class, 'toggle']);

    // Coupons
    Route::apiResource('coupons', Admin\CouponController::class);

    // Reviews
    Route::get('/reviews',                [Admin\ReviewController::class, 'index']);
    Route::put('/reviews/{id}/status',    [Admin\ReviewController::class, 'updateStatus']);
    Route::delete('/reviews/{id}',        [Admin\ReviewController::class, 'destroy']);
});
