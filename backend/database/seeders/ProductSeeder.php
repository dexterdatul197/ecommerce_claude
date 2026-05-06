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
        $cat = fn(string $slug) => Category::where('slug', $slug)->first()?->id;

        $products = [
            // ── Electronics › Phones ──────────────────────────────────────────
            ['sku' => 'WBH-001', 'category' => 'electronics-phones', 'featured' => true,
             'name' => 'Wireless Bluetooth Headphones', 'price' => 79.99, 'compare_price' => 99.99, 'stock' => 50,
             'short_description' => 'Premium sound quality with 30hr battery life.',
             'description' => 'Experience crystal-clear audio with active noise cancellation, 30-hour battery life, and a foldable design for portability.',
             'attributes' => [['Color','Black',0,20],['Color','White',0,15],['Color','Blue',5,15]]],

            ['sku' => 'SWP-001', 'category' => 'electronics-phones', 'featured' => true,
             'name' => 'Smart Watch Pro', 'price' => 199.99, 'compare_price' => 249.99, 'stock' => 30,
             'short_description' => 'Track health, fitness, and notifications on your wrist.',
             'description' => 'Advanced smartwatch with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Compatible with iOS and Android.',
             'attributes' => [['Color','Black',0,15],['Color','Silver',0,10],['Color','Rose Gold',10,5]]],

            ['sku' => 'TWS-002', 'category' => 'electronics-phones', 'featured' => false,
             'name' => 'True Wireless Earbuds', 'price' => 49.99, 'compare_price' => 69.99, 'stock' => 80,
             'short_description' => 'Compact earbuds with 24hr total battery life.',
             'description' => 'Ergonomic design with IPX5 water resistance, touch controls, and a charging case that provides 18 additional hours of playback.',
             'attributes' => [['Color','White',0,40],['Color','Black',0,40]]],

            ['sku' => 'PHC-003', 'category' => 'electronics-phones', 'featured' => false,
             'name' => 'Wireless Phone Charger 15W', 'price' => 24.99, 'compare_price' => null, 'stock' => 120,
             'short_description' => 'Fast wireless charging for Qi-enabled devices.',
             'description' => 'Supports 15W fast charging for compatible devices. Non-slip surface, LED indicator, and universal Qi compatibility.',
             'attributes' => [['Color','Black',0,80],['Color','White',0,40]]],

            // ── Electronics › Laptops ─────────────────────────────────────────
            ['sku' => 'USB-HUB-7', 'category' => 'electronics-laptops', 'featured' => false,
             'name' => 'USB-C Hub 7-in-1', 'price' => 39.99, 'compare_price' => null, 'stock' => 100,
             'short_description' => 'Expand your laptop connectivity with 7 ports.',
             'description' => 'Connect up to 7 devices simultaneously. Includes 4K HDMI, 3× USB-A, USB-C PD, SD card, and microSD slots.',
             'attributes' => [['Color','Space Gray',0,60],['Color','Silver',0,40]]],

            ['sku' => 'LPD-001', 'category' => 'electronics-laptops', 'featured' => true,
             'name' => 'Laptop Stand Adjustable', 'price' => 34.99, 'compare_price' => 44.99, 'stock' => 75,
             'short_description' => 'Ergonomic aluminium stand for 10–17" laptops.',
             'description' => 'Six adjustable height settings, foldable and portable design, compatible with MacBook, Dell, HP, and all major laptops.',
             'attributes' => [['Color','Silver',0,50],['Color','Black',0,25]]],

            ['sku' => 'MKB-001', 'category' => 'electronics-laptops', 'featured' => false,
             'name' => 'Mechanical Keyboard TKL', 'price' => 89.99, 'compare_price' => 109.99, 'stock' => 40,
             'short_description' => 'Tenkeyless mechanical keyboard with RGB backlight.',
             'description' => 'Blue switches for tactile feedback, per-key RGB lighting, durable PBT keycaps, USB-C detachable cable.',
             'attributes' => [['Switch','Blue',0,20],['Switch','Red',-5,20]]],

            // ── Electronics › Accessories ─────────────────────────────────────
            ['sku' => 'MSE-001', 'category' => 'electronics-accessories', 'featured' => false,
             'name' => 'Wireless Mouse Slim', 'price' => 29.99, 'compare_price' => 39.99, 'stock' => 90,
             'short_description' => 'Ultra-thin wireless mouse with 12-month battery.',
             'description' => 'Silent click design, 2.4GHz wireless, 1600 DPI adjustable, compatible with Windows and macOS.',
             'attributes' => [['Color','Black',0,50],['Color','White',0,40]]],

            ['sku' => 'CBL-002', 'category' => 'electronics-accessories', 'featured' => false,
             'name' => 'Braided USB-C Cable 2m', 'price' => 14.99, 'compare_price' => null, 'stock' => 200,
             'short_description' => '100W fast-charge braided cable.',
             'description' => 'Nylon braided for durability, supports 100W PD charging and USB 3.2 Gen 2 data transfer speeds up to 10Gbps.',
             'attributes' => [['Color','Black',0,100],['Color','White',0,100]]],

            // ── Clothing › Men ────────────────────────────────────────────────
            ['sku' => 'TSM-001', 'category' => 'clothing-men', 'featured' => false,
             'name' => 'Men\'s Classic Crew T-Shirt', 'price' => 19.99, 'compare_price' => null, 'stock' => 150,
             'short_description' => '100% cotton everyday tee in 6 colours.',
             'description' => 'Pre-shrunk 180gsm jersey cotton, ribbed crew neck, taped shoulder seams for lasting shape.',
             'attributes' => [['Size','S',0,30],['Size','M',0,50],['Size','L',0,50],['Size','XL',0,20]]],

            ['sku' => 'JNM-001', 'category' => 'clothing-men', 'featured' => true,
             'name' => 'Men\'s Slim Fit Jeans', 'price' => 49.99, 'compare_price' => 64.99, 'stock' => 60,
             'short_description' => 'Stretch denim slim fit for all-day comfort.',
             'description' => '98% cotton 2% elastane blend, five-pocket styling, available in multiple washes.',
             'attributes' => [['Size','30x30',0,15],['Size','32x32',0,20],['Size','34x32',0,15],['Size','36x32',0,10]]],

            ['sku' => 'HOM-001', 'category' => 'clothing-men', 'featured' => false,
             'name' => 'Men\'s Zip-Up Hoodie', 'price' => 44.99, 'compare_price' => 54.99, 'stock' => 45,
             'short_description' => 'Fleece-lined zip hoodie for cool days.',
             'description' => '80% cotton 20% polyester, kangaroo pocket, ribbed cuffs, available in neutral colours.',
             'attributes' => [['Size','S',0,10],['Size','M',0,15],['Size','L',0,15],['Size','XL',0,5]]],

            // ── Clothing › Women ──────────────────────────────────────────────
            ['sku' => 'TSW-001', 'category' => 'clothing-women', 'featured' => true,
             'name' => 'Women\'s Floral Blouse', 'price' => 29.99, 'compare_price' => 39.99, 'stock' => 80,
             'short_description' => 'Lightweight floral print blouse for any occasion.',
             'description' => 'Soft viscose fabric, relaxed fit, V-neckline, short sleeves. Machine washable.',
             'attributes' => [['Size','XS',0,15],['Size','S',0,25],['Size','M',0,25],['Size','L',0,15]]],

            ['sku' => 'LGW-001', 'category' => 'clothing-women', 'featured' => false,
             'name' => 'Women\'s High-Waist Leggings', 'price' => 34.99, 'compare_price' => null, 'stock' => 100,
             'short_description' => 'Four-way stretch leggings with pocket.',
             'description' => '88% polyester 12% spandex, moisture-wicking, hidden waistband pocket, squat-proof.',
             'attributes' => [['Size','XS',0,20],['Size','S',0,30],['Size','M',0,30],['Size','L',0,20]]],

            // ── Clothing › Kids ───────────────────────────────────────────────
            ['sku' => 'KDT-001', 'category' => 'clothing-kids', 'featured' => false,
             'name' => 'Kids\' Graphic Tee Pack (3)', 'price' => 24.99, 'compare_price' => 34.99, 'stock' => 60,
             'short_description' => 'Pack of 3 fun graphic tees for kids.',
             'description' => '100% soft cotton, pre-shrunk, machine washable, bright colours kids love.',
             'attributes' => [['Size','4T',0,20],['Size','5T',0,20],['Size','6',0,20]]],

            // ── Home & Garden › Furniture ─────────────────────────────────────
            ['sku' => 'DSK-001', 'category' => 'home-garden-furniture', 'featured' => true,
             'name' => 'Minimalist Office Desk', 'price' => 189.99, 'compare_price' => 229.99, 'stock' => 15,
             'short_description' => 'Clean-lined desk for home office setups.',
             'description' => 'Solid MDF top with powder-coated steel legs, 120×60cm surface, cable management grommet included.',
             'attributes' => [['Color','White',0,8],['Color','Walnut',10,7]]],

            ['sku' => 'BSF-001', 'category' => 'home-garden-furniture', 'featured' => false,
             'name' => 'Bookshelf 5-Tier', 'price' => 79.99, 'compare_price' => 99.99, 'stock' => 20,
             'short_description' => 'Modern 5-tier open bookshelf.',
             'description' => 'Supports up to 25kg per shelf, easy assembly, anti-tip hardware included.',
             'attributes' => [['Color','White',0,12],['Color','Black',0,8]]],

            // ── Home & Garden › Kitchen ───────────────────────────────────────
            ['sku' => 'KNF-001', 'category' => 'home-garden-kitchen', 'featured' => false,
             'name' => 'Chef\'s Knife 8-inch', 'price' => 39.99, 'compare_price' => 54.99, 'stock' => 50,
             'short_description' => 'High-carbon stainless steel chef\'s knife.',
             'description' => 'German steel blade with full-tang handle, razor-sharp edge, ergonomic grip, dishwasher safe.',
             'attributes' => []],

            ['sku' => 'CTB-001', 'category' => 'home-garden-kitchen', 'featured' => true,
             'name' => 'Bamboo Cutting Board Set (3)', 'price' => 29.99, 'compare_price' => null, 'stock' => 70,
             'short_description' => 'Set of 3 eco-friendly bamboo cutting boards.',
             'description' => 'Small, medium, and large boards. Naturally antimicrobial, juice groove, easy-grip handles.',
             'attributes' => []],

            ['sku' => 'CFM-001', 'category' => 'home-garden-kitchen', 'featured' => false,
             'name' => 'Pour-Over Coffee Maker', 'price' => 34.99, 'compare_price' => 44.99, 'stock' => 35,
             'short_description' => 'Borosilicate glass pour-over for smooth coffee.',
             'description' => 'Heat-resistant borosilicate glass, 600ml capacity, includes reusable stainless filter, hand-crafted wooden collar.',
             'attributes' => []],

            // ── Home & Garden › Garden ────────────────────────────────────────
            ['sku' => 'PLT-001', 'category' => 'home-garden-garden', 'featured' => false,
             'name' => 'Self-Watering Planter Set (4)', 'price' => 27.99, 'compare_price' => null, 'stock' => 45,
             'short_description' => 'Set of 4 self-watering pots for indoor plants.',
             'description' => 'Built-in water reservoir keeps plants hydrated for up to 2 weeks. Drainage holes, saucers included.',
             'attributes' => [['Color','White',0,25],['Color','Terracotta',0,20]]],

            // ── Sports › Outdoor ──────────────────────────────────────────────
            ['sku' => 'BKP-001', 'category' => 'sports-outdoor', 'featured' => true,
             'name' => 'Hiking Backpack 40L', 'price' => 74.99, 'compare_price' => 94.99, 'stock' => 25,
             'short_description' => 'Durable 40L pack for day hikes and overnight trips.',
             'description' => '210D ripstop nylon, padded hip belt, hydration bladder compatible, rain cover included.',
             'attributes' => [['Color','Forest Green',0,12],['Color','Navy',0,13]]],

            ['sku' => 'TNT-001', 'category' => 'sports-outdoor', 'featured' => false,
             'name' => 'Waterproof Tent 2-Person', 'price' => 129.99, 'compare_price' => 159.99, 'stock' => 10,
             'short_description' => '3-season 2-person tent with easy setup.',
             'description' => '3000mm waterproof rating, fibreglass poles, vestibule storage area, sets up in under 10 minutes.',
             'attributes' => []],

            // ── Sports › Fitness ──────────────────────────────────────────────
            ['sku' => 'YGM-001', 'category' => 'sports-fitness', 'featured' => false,
             'name' => 'Yoga Mat Extra Thick 6mm', 'price' => 29.99, 'compare_price' => null, 'stock' => 60,
             'short_description' => 'Non-slip 6mm yoga mat with carry strap.',
             'description' => 'TPE foam construction, eco-friendly, 183×61cm, excellent grip on both sides, lightweight carry strap.',
             'attributes' => [['Color','Purple',0,20],['Color','Blue',0,20],['Color','Black',0,20]]],

            ['sku' => 'RES-001', 'category' => 'sports-fitness', 'featured' => true,
             'name' => 'Resistance Bands Set (5)', 'price' => 19.99, 'compare_price' => 27.99, 'stock' => 100,
             'short_description' => 'Progressive resistance bands from 10–50lb.',
             'description' => 'Natural latex, colour-coded by resistance level, door anchor and carry bag included, suitable for all fitness levels.',
             'attributes' => []],

            ['sku' => 'KTB-001', 'category' => 'sports-fitness', 'featured' => false,
             'name' => 'Adjustable Kettlebell 4–16kg', 'price' => 59.99, 'compare_price' => 79.99, 'stock' => 20,
             'short_description' => 'Space-saving adjustable kettlebell.',
             'description' => 'Dial-select weight adjustment, cast iron plates, comfortable rubber handle, replaces 4 separate weights.',
             'attributes' => []],

            // ── Sports › Team Sports ──────────────────────────────────────────
            ['sku' => 'BSK-001', 'category' => 'sports-team-sports', 'featured' => false,
             'name' => 'Basketball Size 7 Official', 'price' => 34.99, 'compare_price' => null, 'stock' => 40,
             'short_description' => 'Official size 7 indoor/outdoor basketball.',
             'description' => 'Deep channel design for grip, durable rubber bladder, suitable for all court surfaces.',
             'attributes' => []],

            ['sku' => 'SCR-001', 'category' => 'sports-team-sports', 'featured' => false,
             'name' => 'Soccer Ball Size 5', 'price' => 24.99, 'compare_price' => 29.99, 'stock' => 55,
             'short_description' => 'Match-quality size 5 soccer ball.',
             'description' => 'Thermally bonded panels, latex bladder for consistent bounce, suitable for grass and artificial turf.',
             'attributes' => []],
        ];

        foreach ($products as $data) {
            $attributes = $data['attributes'] ?? [];
            unset($data['attributes']);

            $categorySlug = $data['category'];
            unset($data['category']);

            $data['slug']        = Str::slug($data['name']);
            $data['category_id'] = $cat($categorySlug);
            $data['status'] = 'active';

            $product = Product::firstOrCreate(['sku' => $data['sku']], $data);

            if ($product->wasRecentlyCreated && !empty($attributes)) {
                $product->attributes()->createMany(
                    array_map(fn($a) => [
                        'name'           => $a[0],
                        'value'          => $a[1],
                        'price_modifier' => $a[2],
                        'stock'          => $a[3] ?? 0,
                    ], $attributes)
                );
            }
        }
    }
}
