<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');
        $secret  = config('services.stripe.webhook_secret');

        if ($secret) {
            try {
                $event = Webhook::constructEvent($payload, $sig, $secret);
            } catch (SignatureVerificationException $e) {
                return response()->json(['message' => 'Invalid signature.'], 400);
            }
        } else {
            $event = json_decode($payload);
        }

        match ($event->type ?? '') {
            'payment_intent.succeeded' => $this->handlePaymentSucceeded($event->data->object->id),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($event->data->object->id),
            default => null,
        };

        return response()->json(['message' => 'Webhook received.']);
    }

    private function handlePaymentSucceeded(string $intentId): void
    {
        Order::where('payment_intent_id', $intentId)
            ->whereNot('payment_status', 'paid')
            ->update(['payment_status' => 'paid', 'status' => 'processing']);
    }

    private function handlePaymentFailed(string $intentId): void
    {
        Order::where('payment_intent_id', $intentId)
            ->update(['payment_status' => 'failed']);
    }
}
