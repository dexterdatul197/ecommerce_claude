<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customers = User::where('role', 'customer')
            ->withCount('orders')
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => UserResource::collection($customers),
            'meta' => ['total' => $customers->total(), 'last_page' => $customers->lastPage()],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')
            ->with(['orders' => fn($q) => $q->latest()->limit(10), 'addresses'])
            ->withCount('orders')
            ->findOrFail($id);

        return response()->json([
            'data' => array_merge((new UserResource($customer))->resolve(), [
                'orders_count' => $customer->orders_count,
                'total_spent'  => round($customer->orders->where('payment_status', 'paid')->sum('total'), 2),
                'recent_orders'=> $customer->orders,
                'addresses'    => $customer->addresses,
            ]),
        ]);
    }

    public function toggle(int $id): JsonResponse
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update(['is_active' => ! $customer->is_active]);

        $state = $customer->is_active ? 'activated' : 'deactivated';

        return response()->json(['message' => "Customer {$state}."]);
    }
}
