"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MoyasarTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCreatePayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // This is a test with a valid test card
      const response = await fetch('/api/payments/moyasar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // 100 SAR
          currency: 'SAR',
          source: {
            type: 'creditcard',
            number: '4111111111111111', // Test card number
            cvc: '123',
            month: 12,
            year: 25, // 2025
            holder_name: 'Test User',
          },
          description: 'Test Payment',
          metadata: {
            test: 'true'
          }
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(data.error || `HTTP error ${response.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testGetPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Replace with a real payment ID for testing
      const paymentId = 'test_payment_id';
      const response = await fetch(`/api/payments/moyasar?id=${paymentId}`);

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(data.error || `HTTP error ${response.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Moyasar Payment Test</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={testCreatePayment} 
            disabled={loading}
            className="w-full py-6 text-lg"
          >
            {loading ? 'Processing...' : 'Test Create Payment'}
          </Button>
          
          <Button 
            onClick={testGetPayment} 
            disabled={loading}
            variant="outline"
            className="w-full py-6 text-lg"
          >
            {loading ? 'Loading...' : 'Test Get Payment'}
          </Button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">Result</h3>
            <pre className="mt-2 text-sm text-green-700 overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800">Test Information</h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Using Moyasar test environment</li>
            <li>Test card number: 4111111111111111</li>
            <li>For real testing, you'll need valid Moyasar API keys</li>
            <li>Make sure to set NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY and MOYASAR_SECRET_KEY in your environment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}