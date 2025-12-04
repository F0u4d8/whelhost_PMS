'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  CreditCard,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface DirectMoyasarCheckoutProps {
  bookingId: string;
  amount: number;
  currency: string;
  guestName: string;
  description?: string;
  onComplete?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export function DirectMoyasarCheckout({
  bookingId,
  amount,
  currency,
  guestName,
  description = 'Payment for booking #' + bookingId.substring(0, 8),
  onComplete,
  onError
}: DirectMoyasarCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moyasar/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
          metadata: {
            booking_id: bookingId,
            guest_name: guestName,
            user_id: '',
          },
          callback_url: `${window.location.origin}/api/moyasar/webhook`,
          cancel_url: `${window.location.origin}/dashboard/bookings/${bookingId}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error && data.error.includes('network restrictions') || data.error.includes('outbound connections')) {
          setError('Payment processing is temporarily unavailable due to network restrictions. Please contact support to complete your payment.');
          onError?.('Network restrictions are preventing direct payment processing.');
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } else {
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          throw new Error('No checkout URL received from Moyasar');
        }
      }
    } catch (err: any) {
      console.error('Error creating Moyasar checkout:', err);

      if (err.message.includes('network restrictions') || err.message.includes('outbound connections')) {
        setError('Payment processing is temporarily unavailable due to network restrictions. Please contact support to complete your payment.');
        onError?.('Network restrictions are preventing direct payment processing.');
      } else {
        setError(err.message);
        onError?.(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-white">Payment Details</h1>
        <p className="text-white/80 text-sm">Secure payment for your customer</p>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-800 to-amber-900 text-white overflow-hidden">
        <CardHeader className="pb-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-800 opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <CardTitle className="text-white font-semibold">Payment Details</CardTitle>
              <CardDescription className="text-amber-100/90 mt-1 text-sm">
                Secure payment for your customer
              </CardDescription>
            </div>
            <Badge className="bg-amber-700 text-white border-amber-600">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-amber-700/50">
              <span className="text-amber-200">Customer</span>
              <span className="font-medium text-white">{guestName}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-amber-700/50">
              <span className="text-amber-200">Booking ID</span>
              <span className="font-mono text-white">{bookingId.substring(0, 8).toUpperCase()}</span>
            </div>

            <div className="pt-4 pb-2">
              <div className="text-3xl font-bold text-center mb-1">{amount.toFixed(2)}</div>
              <div className="text-center text-xl text-amber-200 font-semibold mb-2">{currency}</div>
              <p className="text-center text-sm text-amber-200/90">{description}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-300 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200 mb-1">Error</p>
                <p className="text-sm text-red-100">{error}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-amber-900/80 p-5 relative z-10">
          <Button
            className="w-full h-12 bg-white text-amber-900 hover:bg-amber-50 font-semibold text-base shadow-lg"
            onClick={createCheckoutSession}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay with Moyasar
              </span>
            )}
          </Button>
          <p className="text-xs text-amber-200/80 text-center mt-3">
            Powered by Moyasar • SSL Encrypted
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}