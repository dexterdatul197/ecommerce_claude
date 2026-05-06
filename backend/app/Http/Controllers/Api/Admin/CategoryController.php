<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::with('children')->withCount('products')->get();

        return response()->json(['data' => CategoryResource::collection($categories)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image'       => ['nullable', 'string'],
            'sort_order'  => ['integer'],
            'is_active'   => ['boolean'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);

        return response()->json(['data' => new CategoryResource($category), 'message' => 'Category created.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::with(['children', 'parent'])->withCount('products')->findOrFail($id);

        return response()->json(['data' => new CategoryResource($category)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'parent_id'   => ['nullable', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image'       => ['nullable', 'string'],
            'sort_order'  => ['sometimes', 'integer'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json(['data' => new CategoryResource($category), 'message' => 'Category updated.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('products')->findOrFail($id);

        if ($category->products_count > 0) {
            return response()->json(['message' => 'Cannot delete a category with products.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
