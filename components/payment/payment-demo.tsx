// components/payment/payment-demo.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";

interface PaymentDemoProps {
  bookingId?: string;
  amount: number;
  currency?: string;
}

export default function PaymentDemo({ bookingId, amount, currency = "SAR" }: PaymentDemoProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate inputs
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || !expiryMonth || !expiryYear || !cvc || !holderName) {
      setError("Please fill in all card details");
      setLoading(false);
      return;
    }

    if (cleanCardNumber.length !== 16 || !/^\d{16}$/.test(cleanCardNumber)) {
      setError("Please enter a valid 16-digit card number");
      setLoading(false);
      return;
    }

    const expMonthInt = parseInt(expiryMonth);
    const expYearInt = parseInt(expiryYear);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (isNaN(expMonthInt) || isNaN(expYearInt) ||
        expMonthInt < 1 || expMonthInt > 12 ||
        expYearInt < currentYear ||
        (expYearInt === currentYear && expMonthInt < currentMonth)) {
      setError("Please enter a valid expiry date");
      setLoading(false);
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setError("Please enter a valid CVC (3-4 digits)");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/moyasar/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          source: {
            type: "creditcard",
            number: cardNumber.replace(/\s/g, ""),
            cvc: cvc,
            month: parseInt(expiryMonth),
            year: parseInt(expiryYear),
            holder_name: holderName,
          },
          description: `Payment for booking #${bookingId || 'demo'}`,
          metadata: {
            booking_id: bookingId || 'demo',
            user_name: holderName,
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        console.log("Payment successful:", data.payment);
      } else {
        setError(data.error || "Payment failed");
        console.error("Payment error:", data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-medium">Payment Successful!</h3>
          <p className="mt-2 text-muted-foreground">Your payment of {currency} {amount.toFixed(2)} has been processed.</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700">
            Thank you for your payment. Your booking is now confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Card className="border-0 bg-slate-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry-month">Expiry Month</Label>
              <Input
                id="expiry-month"
                type="text"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").substring(0, 2))}
                maxLength={2}
                className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-year">Expiry Year</Label>
              <Input
                id="expiry-year"
                type="text"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").substring(0, 2))}
                maxLength={2}
                className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").substring(0, 4))}
              maxLength={4}
              className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holder-name">Cardholder Name</Label>
            <Input
              id="holder-name"
              type="text"
              placeholder="John Doe"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">
              <span className="font-medium">Amount:</span> {currency} {amount.toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                Processing...
              </>
            ) : (
              `Pay ${currency} ${amount.toFixed(2)}`
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}