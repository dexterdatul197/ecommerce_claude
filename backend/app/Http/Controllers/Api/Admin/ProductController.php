<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['category', 'images'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('category_id'), fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => ['total' => $products->total(), 'last_page' => $products->lastPage()],
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data         = $request->validated();
        $data['slug'] = Str::slug($data['name']);
        $attributes   = $data['attributes'] ?? [];
        unset($data['attributes']);

        $product = DB::transaction(function () use ($data, $attributes) {
            $product = Product::create($data);

            if (! empty($attributes)) {
                $product->attributes()->createMany($attributes);
            }

            return $product;
        });

        return response()->json([
            'data'    => new ProductResource($product->load(['category', 'images', 'attributes'])),
            'message' => 'Product created.',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'images', 'attributes'])->findOrFail($id);

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $data    = $request->validated();

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product->update($data);

        return response()->json([
            'data'    => new ProductResource($product->fresh(['category', 'images', 'attributes'])),
            'message' => 'Product updated.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->images->each(fn($img) => Storage::disk('public')->delete($img->url));
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function uploadImages(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images'   => ['required', 'array'],
            'images.*' => ['required', 'image', 'max:5120'],
        ]);

        $uploaded = [];
        foreach ($request->file('images') as $index => $file) {
            $path = $file->store("products/{$id}", 'public');
            $image = $product->images()->create([
                'url'        => Storage::disk('public')->url($path),
                'alt'        => $product->name,
                'sort_order' => $product->images()->max('sort_order') + $index + 1,
            ]);
            $uploaded[] = $image;
        }

        return response()->json([
            'data'    => $uploaded,
            'message' => count($uploaded).' image(s) uploaded.',
        ], 201);
    }

    public function deleteImage(int $id, int $imageId): JsonResponse
    {
        $image = ProductImage::where('product_id', $id)->findOrFail($imageId);
        Storage::disk('public')->delete($image->url);
        $image->delete();

        return response()->json(['message' => 'Image deleted.']);
    }
}
