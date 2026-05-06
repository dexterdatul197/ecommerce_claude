<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();

        return response()->json(['data' => AddressResource::collection($addresses)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'phone'      => ['required', 'string', 'max:30'],
            'line1'      => ['required', 'string'],
            'line2'      => ['nullable', 'string'],
            'city'       => ['required', 'string'],
            'state'      => ['required', 'string'],
            'zip'        => ['required', 'string', 'max:20'],
            'country'    => ['required', 'string', 'size:2'],
            'type'       => ['in:shipping,billing'],
            'is_default' => ['boolean'],
        ]);

        $data['user_id'] = $request->user()->id;

        if (! empty($data['is_default'])) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address = Address::create($data);

        return response()->json(['data' => new AddressResource($address), 'message' => 'Address saved.'], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json(['data' => new AddressResource($address)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'name'    => ['sometimes', 'string', 'max:255'],
            'phone'   => ['sometimes', 'string', 'max:30'],
            'line1'   => ['sometimes', 'string'],
            'line2'   => ['nullable', 'string'],
            'city'    => ['sometimes', 'string'],
            'state'   => ['sometimes', 'string'],
            'zip'     => ['sometimes', 'string', 'max:20'],
            'country' => ['sometimes', 'string', 'size:2'],
            'type'    => ['in:shipping,billing'],
        ]);

        $address->update($data);

        return response()->json(['data' => new AddressResource($address), 'message' => 'Address updated.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        Address::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        DB::transaction(function () use ($request, $address) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return response()->json(['message' => 'Default address updated.']);
    }
}
