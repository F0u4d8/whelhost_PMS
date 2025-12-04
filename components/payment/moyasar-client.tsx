// components/payment/moyasar-client.tsx

'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Moyasar: any;
  }
}

interface MoyasarClientProps {
  amount: number;
  currency?: string;
  description?: string;
  publishableApiKey?: string;
  onSuccess: (payment: any) => void;
  onError: (error: any) => void;
  bookingId?: string;
}

export default function MoyasarClient({ 
  amount, 
  currency = 'SAR', 
  description = 'Hotel Booking Payment', 
  onSuccess, 
  onError,
  bookingId 
}: MoyasarClientProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Use the publishable key from environment variables
  const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Moyasar) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && typeof window !== 'undefined' && window.Moyasar) {
      try {
        const moyasarConfig = {
          element: '#payment-form',
          key: publishableKey,
          amount: Math.round(amount * 100), // Convert to smallest currency unit
          currency: currency,
          description: description,
          metadata: {
            booking_id: bookingId || 'unknown'
          },
          callbacks: {
            onSuccess: (payment: any) => {
              console.log('Payment successful:', payment);
              onSuccess(payment);
            },
            onError: (error: any) => {
              console.error('Payment error:', error);
              onError(error);
            }
          }
        };

        // Initialize Moyasar form
        window.Moyasar.init(moyasarConfig);
      } catch (err) {
        console.error('Error initializing Moyasar:', err);
        onError(err);
      }
    }
  }, [scriptLoaded, amount, currency, description, publishableKey, bookingId, onSuccess, onError]);

  return (
    <div>
      {/* Load Moyasar library */}
      <Script
        src="https://cdn.moyasar.com/mpf/latest/moyasar.js"
        strategy="beforeInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={(error) => console.error('Error loading Moyasar script:', error)}
      />
      
      {/* Moyasar payment form will be mounted here */}
      <div id="payment-form" className="border border-gray-200 p-4 rounded-lg"></div>
    </div>
  );
}