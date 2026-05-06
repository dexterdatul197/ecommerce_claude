# E-Commerce Backend Setup Script
# Run this AFTER installing Laragon and opening its terminal
# Usage: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  E-Commerce Laravel Backend Setup      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Install dependencies
Write-Host "`n[1/6] Installing Composer dependencies..." -ForegroundColor Yellow
composer install --no-interaction

# 2. Copy .env
Write-Host "`n[2/6] Setting up environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env created from .env.example" -ForegroundColor Green
} else {
    Write-Host "  .env already exists, skipping." -ForegroundColor Gray
}

# 3. Generate app key
Write-Host "`n[3/6] Generating application key..." -ForegroundColor Yellow
php artisan key:generate

# 4. Create storage symlink
Write-Host "`n[4/6] Creating storage symlink..." -ForegroundColor Yellow
php artisan storage:link

# 5. Run migrations
Write-Host "`n[5/6] Running database migrations..." -ForegroundColor Yellow
Write-Host "  Make sure your database 'ecommerce' exists in MySQL!" -ForegroundColor Magenta
Write-Host "  You can create it with: CREATE DATABASE ecommerce;" -ForegroundColor Magenta
$confirm = Read-Host "  Press Enter to run migrations (or Ctrl+C to abort)"
php artisan migrate

# 6. Seed database
Write-Host "`n[6/6] Seeding database with sample data..." -ForegroundColor Yellow
php artisan db:seed

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start the development server:" -ForegroundColor Cyan
Write-Host "  php artisan serve" -ForegroundColor White
Write-Host ""
Write-Host "API base URL: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@ecommerce.com / password" -ForegroundColor White
Write-Host "  Customer: customer@ecommerce.com / password" -ForegroundColor White
