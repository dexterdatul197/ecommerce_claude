<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        // Specific Unsplash photo IDs matched to each product
        // URL format: https://images.unsplash.com/photo-{id}?w=600&h=600&fit=crop&auto=format
        $base = 'https://images.unsplash.com/photo-';
        $q    = '?w=600&h=600&fit=crop&auto=format';

        $images = [
            // ── Electronics › Phones ──────────────────────────────────────────
            'WBH-001' => [ // Wireless Bluetooth Headphones
                $base.'1505740420928-5e560c06d30e'.$q, // over-ear headphones on dark bg
                $base.'1484704849700-f032ad7df5d1'.$q, // headphones flat lay
            ],
            'SWP-001' => [ // Smart Watch Pro
                $base.'1523275335684-37898b6baf30'.$q, // elegant watch face
                $base.'1579586337278-3befd40fd17a'.$q, // smartwatch on wrist
            ],
            'TWS-002' => [ // True Wireless Earbuds
                $base.'1590658268037-6bf12165a8df'.$q, // earbuds in charging case
                $base.'1606220945770-b5b6c2c55bf1'.$q, // earbuds close-up
            ],
            'PHC-003' => [ // Wireless Phone Charger
                $base.'1603899122634-f086ca5f5ddd'.$q, // phone on wireless pad
            ],

            // ── Electronics › Laptops ─────────────────────────────────────────
            'USB-HUB-7' => [ // USB-C Hub 7-in-1
                $base.'1611532736597-de2d4265fba3'.$q, // laptop ports / hub accessories
                $base.'1526374965328-7f61d4dc18c5'.$q, // tech cables on desk
            ],
            'LPD-001' => [ // Laptop Stand Adjustable
                $base.'1588872657578-7eaee4827d56'.$q, // MacBook on aluminium stand
                $base.'1593642632559-0c6d3fc62b89'.$q, // laptop desk setup
            ],
            'MKB-001' => [ // Mechanical Keyboard TKL
                $base.'1587829741301-dc798b83add3'.$q, // TKL keyboard RGB
                $base.'1560472354-b33ff0c44a43'.$q,   // keyboard side angle
            ],

            // ── Electronics › Accessories ─────────────────────────────────────
            'MSE-001' => [ // Wireless Mouse Slim
                $base.'1527864550417-7fd91fc51a46'.$q, // wireless mouse on desk
            ],
            'CBL-002' => [ // Braided USB-C Cable 2m
                $base.'1558618666-fcd25c85cd64'.$q,   // braided cable coiled
            ],

            // ── Clothing › Men ────────────────────────────────────────────────
            'TSM-001' => [ // Men's Classic Crew T-Shirt
                $base.'1521572163474-6864f9cf17ab'.$q, // man in plain white tee
                $base.'1618354691373-d851c5c827a4'.$q, // t-shirt flat lay
            ],
            'JNM-001' => [ // Men's Slim Fit Jeans
                $base.'1542272604-787c3835535d'.$q,   // blue slim jeans
                $base.'1473966968600-fa4cbed554eb'.$q, // jeans detail
            ],
            'HOM-001' => [ // Men's Zip-Up Hoodie
                $base.'1556821840-3a63f15732ce'.$q,   // grey zip hoodie
                $base.'1620799139834-6d8fea8b0606'.$q, // hoodie laid flat
            ],

            // ── Clothing › Women ──────────────────────────────────────────────
            'TSW-001' => [ // Women's Floral Blouse
                $base.'1594938298603-e8c26eea49b6'.$q, // floral patterned top
                $base.'1515886657613-9f3515b0c78f'.$q, // women's blouse detail
            ],
            'LGW-001' => [ // Women's High-Waist Leggings
                $base.'1506629082955-511b1aa562c8'.$q, // yoga/athletic leggings
                $base.'1544216717-3bbf52512659'.$q,   // leggings active shot
            ],

            // ── Clothing › Kids ───────────────────────────────────────────────
            'KDT-001' => [ // Kids' Graphic Tee Pack
                $base.'1519238263530-99bdd11df2ea'.$q, // colourful kids shirts
                $base.'1503944168849-8e9de21b5e68'.$q, // children's clothing display
            ],

            // ── Home & Garden › Furniture ─────────────────────────────────────
            'DSK-001' => [ // Minimalist Office Desk
                $base.'1518455027359-f3f8164ba6bd'.$q, // clean white desk setup
                $base.'1593642702821-c8da6771f0c6'.$q, // minimal home office
            ],
            'BSF-001' => [ // Bookshelf 5-Tier
                $base.'1507842217343-583bb2515096'.$q, // styled bookshelf
                $base.'1598300042247-d088f8ab3a91'.$q, // bookshelf with books
            ],

            // ── Home & Garden › Kitchen ───────────────────────────────────────
            'KNF-001' => [ // Chef's Knife
                $base.'1593618998160-e34014e67546'.$q, // chef's knife on board
                $base.'1566454544259-f4b41542928e'.$q, // knife set
            ],
            'CTB-001' => [ // Bamboo Cutting Board Set
                $base.'1556909114-f6e7ad7d3136'.$q,   // bamboo cutting board
                $base.'1540420773420-3366772f4999'.$q, // cutting board in kitchen
            ],
            'CFM-001' => [ // Pour-Over Coffee Maker
                $base.'1495474472287-4d71bcdd2085'.$q, // pour-over brewing
                $base.'1509785307050-d4066910ec1e'.$q, // glass coffee carafe
            ],

            // ── Home & Garden › Garden ────────────────────────────────────────
            'PLT-001' => [ // Self-Watering Planter Set
                $base.'1416879595882-3373a0480b5b'.$q, // plants in white pots
                $base.'1463936212780-92842dea2b5f'.$q, // indoor plants shelf
            ],

            // ── Sports › Outdoor ──────────────────────────────────────────────
            'BKP-001' => [ // Hiking Backpack 40L
                $base.'1553062407-98eeb64c6a62'.$q,   // green hiking backpack
                $base.'1501555088652-021cf166bc82'.$q, // backpack on trail
            ],
            'TNT-001' => [ // Waterproof Tent 2-Person
                $base.'1504280390367-361c6d9f38f4'.$q, // tent in nature
                $base.'1537225228614-56cc3556d7ed'.$q, // tent campfire scene
            ],

            // ── Sports › Fitness ──────────────────────────────────────────────
            'YGM-001' => [ // Yoga Mat Extra Thick
                $base.'1544367567-0f2fcb009e0b'.$q,   // purple yoga mat unrolled
                $base.'1593164842264-854604db2260'.$q, // yoga mat in studio
            ],
            'RES-001' => [ // Resistance Bands Set
                $base.'1517344884509-a0c97ec11bcc'.$q, // colourful resistance bands
                $base.'1518611012118-696072aa579a'.$q, // bands workout
            ],
            'KTB-001' => [ // Adjustable Kettlebell
                $base.'1581009146145-b5ef050c2e1e'.$q, // kettlebell on gym floor
                $base.'1534438327276-14e5300c3a48'.$q, // weights gym equipment
            ],

            // ── Sports › Team Sports ──────────────────────────────────────────
            'BSK-001' => [ // Basketball
                $base.'1546519638-68e109498ffc'.$q,   // basketball on court
                $base.'1577471488278-16eec37ffcc2'.$q, // basketball close-up
            ],
            'SCR-001' => [ // Soccer Ball
                $base.'1579952363873-27f3bade9f55'.$q, // soccer ball on pitch
                $base.'1552667466-07770ae110d0'.$q,   // soccer ball close-up
            ],
        ];

        foreach ($images as $sku => $urls) {
            $product = Product::where('sku', $sku)->first();
            if (! $product) continue;

            // Replace all existing images
            $product->images()->delete();

            foreach ($urls as $i => $url) {
                $product->images()->create([
                    'url'        => $url,
                    'alt'        => $product->name,
                    'sort_order' => $i + 1,
                ]);
            }
        }
    }
}
