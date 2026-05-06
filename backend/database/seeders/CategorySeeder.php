<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'children' => ['Phones', 'Laptops', 'Accessories']],
            ['name' => 'Clothing',    'children' => ['Men', 'Women', 'Kids']],
            ['name' => 'Home & Garden','children' => ['Furniture', 'Kitchen', 'Garden']],
            ['name' => 'Sports',      'children' => ['Outdoor', 'Fitness', 'Team Sports']],
        ];

        foreach ($categories as $i => $cat) {
            $parent = Category::create([
                'name'       => $cat['name'],
                'slug'       => Str::slug($cat['name']),
                'sort_order' => $i,
                'is_active'  => true,
            ]);

            foreach ($cat['children'] as $j => $child) {
                Category::create([
                    'name'       => $child,
                    'slug'       => Str::slug($cat['name'].'-'.$child),
                    'parent_id'  => $parent->id,
                    'sort_order' => $j,
                    'is_active'  => true,
                ]);
            }
        }
    }
}
