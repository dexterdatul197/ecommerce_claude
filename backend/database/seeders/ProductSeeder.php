<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::where('slug', 'electronics-phones')->first()
            ?? Category::first();

        $products = [
            [
                'name'              => 'Wireless Bluetooth Headphones',
                'price'             => 79.99,
                'compare_price'     => 99.99,
                'stock'             => 50,
                'sku'               => 'WBH-001',
                'status'            => 'active',
                'featured'          => true,
                'short_description' => 'Premium sound quality with 30hr battery life.',
                'description'       => 'Experience crystal-clear audio with our wireless headphones. Features active noise cancellation, 30-hour battery life, and foldable design for portability.',
            ],
            [
                'name'              => 'Smart Watch Pro',
                'price'             => 199.99,
                'compare_price'     => 249.99,
                'stock'             => 30,
                'sku'               => 'SWP-001',
                'status'            => 'active',
                'featured'          => true,
                'short_description' => 'Track health, fitness, and notifications on your wrist.',
                'description'       => 'Advanced smartwatch with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.',
            ],
            [
                'name'              => 'USB-C Hub 7-in-1',
                'price'             => 39.99,
                'compare_price'     => null,
                'stock'             => 100,
                'sku'               => 'USB-HUB-7',
                'status'            => 'active',
                'featured'          => false,
                'short_description' => 'Expand your laptop connectivity with 7 ports.',
                'description'       => 'Connect up to 7 devices simultaneously. Includes 4K HDMI, 3x USB-A, USB-C PD, SD card, and microSD slots.',
            ],
        ];

        foreach ($products as $data) {
            $data['slug']        = Str::slug($data['name']);
            $data['category_id'] = $category?->id;

            $product = Product::firstOrCreate(['sku' => $data['sku']], $data);

            $product->attributes()->createMany([
                ['name' => 'Color', 'value' => 'Black', 'price_modifier' => 0, 'stock' => 20],
                ['name' => 'Color', 'value' => 'White', 'price_modifier' => 0, 'stock' => 15],
                ['name' => 'Color', 'value' => 'Blue',  'price_modifier' => 5, 'stock' => 15],
            ]);
        }
    }
}
