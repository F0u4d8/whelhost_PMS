"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, AlertCircle, CheckCircle2, Star, Award, Sparkles, Lock, UserIcon, Shield } from "lucide-react";

interface MoyasarCheckoutFormProps {
  amount: number;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}

export function MoyasarCheckoutForm({ amount, description, callbackUrl, metadata }: MoyasarCheckoutFormProps) {
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

  // Format expiry date
  const handleExpiryChange = (field: 'month' | 'year', value: string) => {
    const digitsOnly = value.replace(/\D/g, "");

    if (field === 'month') {
      const month = digitsOnly.substring(0, 2);
      setExpiryMonth(month);
    } else {
      const year = digitsOnly.substring(0, 2);
      setExpiryYear(year);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const expMonth = parseInt(expiryMonth);
    const expYear = parseInt(expiryYear);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (isNaN(expMonth) || isNaN(expYear) ||
        expMonth < 1 || expMonth > 12 ||
        expYear < currentYear ||
        (expYear === currentYear && expMonth < currentMonth)) {
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
      // Prepare card data for sending to our API
      const paymentData = {
        amount: amount,
        currency: "SAR",
        source: {
          type: "creditcard",
          number: cleanCardNumber,
          cvc: cvc,
          month: parseInt(expiryMonth),
          year: parseInt(expiryYear),
          holder_name: holderName,
        },
        description: description,
        metadata: {
          ...metadata,
          user_name: holderName,
        }
      };

      // Send to our API route which will process with Moyasar
      const response = await fetch('/api/payments/moyasar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Payment successful - redirect to callback URL
        window.location.href = `${callbackUrl}?id=${data.payment.id}&status=success`;
      } else {
        setError(data.error || "Payment failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-amber-300/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-lg"></div>

        <div className="space-y-6 text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium italic">Payment Processing!</h3>
            <p className="mt-2 text-muted-foreground italic">Your payment of {amount} SAR is being processed.</p>
          </div>
          <div className="p-4 bg-amber-50/80 rounded-lg border border-amber-200">
            <p className="flex items-start gap-2">
              <span className="inline-block mt-0.5">✅</span>
              <span className="italic">Please wait while we process your payment...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-amber-300/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-lg"></div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="card-number" className="text-sm font-medium italic flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Card Number
          </Label>
          <div className="relative">
            <Input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
            <CreditCard className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry-month" className="text-sm font-medium italic">
              Expiry Month
            </Label>
            <Input
              id="expiry-month"
              type="text"
              placeholder="MM"
              value={expiryMonth}
              onChange={(e) => handleExpiryChange('month', e.target.value)}
              maxLength={2}
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry-year" className="text-sm font-medium italic">
              Expiry Year
            </Label>
            <Input
              id="expiry-year"
              type="text"
              placeholder="YY"
              value={expiryYear}
              onChange={(e) => handleExpiryChange('year', e.target.value)}
              maxLength={2}
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvc" className="text-sm font-medium italic">
            CVC
          </Label>
          <Input
            id="cvc"
            type="text"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").substring(0, 4))}
            maxLength={4}
            className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="holder-name" className="text-sm font-medium italic flex items-center gap-1">
            <UserIcon className="h-4 w-4" />
            Cardholder Name
          </Label>
          <Input
            id="holder-name"
            type="text"
            placeholder="John Doe"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
          />
        </div>

        <div className="p-4 bg-amber-50/80 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800 flex items-center justify-between">
            <span className="font-medium">Amount:</span>
            <span className="font-serif text-lg font-medium">{amount} SAR</span>
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground italic">Secure payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground italic">Protected by Moyasar</span>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-none text-sm font-medium tracking-wide italic bg-amber-800 hover:bg-amber-700 text-white border-2 border-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="mr-2">Processing...</span>
            </>
          ) : (
            `Pay ${amount} SAR`
          )}
        </Button>

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span className="text-muted-foreground text-xs italic">Powered by Moyasar</span>
          </div>
        </div>
      </form>
    </div>
  );
}
