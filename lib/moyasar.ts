// lib/moyasar.ts

// Configuration from environment variables or defaults
export const MOYASAR_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ||
             (process.env.NODE_ENV === 'development' ?
              "pk_test_5485343124345345345345345345345345345345" :
              "pk_live_WrJcXqsLLXJe82aYmENsdrqNtMV3cMsVfXp8hf3e"),
  secretKey: process.env.MOYASAR_SECRET_KEY ||
             (process.env.NODE_ENV === 'development' ?
              "sk_test_5485343124345345345345345345345345345345" :
              "sk_live_VQiVB5JWk5NrSoupUaBfxnHSZYxQzMUnTvdvn3Xu"),
  apiUrl: process.env.MOYASAR_API_URL ||
          (process.env.NODE_ENV === 'development' ?
           "https://api-test.moyasar.com/v1/" :
           "https://api.moyasar.com/v1/"),
  currency: process.env.MOYASAR_CURRENCY || "SAR", // Saudi Riyal
  publishableKey: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ||
                  (process.env.NODE_ENV === 'development' ?
                   "pk_test_5485343124345345345345345345345345345345" :
                   "pk_live_WrJcXqsLLXJe82aYmENsdrqNtMV3cMsVfXp8hf3e"),
  supportedNetworks: process.env.MOYASAR_SUPPORTED_NETWORKS?.split(',') || ['mada'], // Only show Mada for a simpler interface
};

export type PlanId = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  amount: number; // Amount in SAR (will be converted to halalas for Moyasar)
  displayPrice: number;
  period: string;
  features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Perfect for getting started',
    amount: 199,
    displayPrice: 199,
    period: 'month',
    features: [
      "Unlimited rooms and units",
      "Real-time booking calendar",
      "Advanced analytics & reports",
      "Smart lock integration",
      "Guest communication tools",
      "Invoice generation & payments",
      "Channel management",
      "Task management for staff",
      "Priority support",
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    description: 'Save 16% compared to monthly',
    amount: 1990,
    displayPrice: 1990,
    period: 'year',
    features: [
      "Unlimited rooms and units",
      "Real-time booking calendar",
      "Advanced analytics & reports",
      "Smart lock integration",
      "Guest communication tools",
      "Invoice generation & payments",
      "Channel management",
      "Task management for staff",
      "Priority support",
    ]
  }
};

export interface PaymentSource {
  type: string;
  number: string;
  cvc: string;
  month: number;
  year: number;
  holder_name: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  source: PaymentSource;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  fee: number;
  refunded_amount: number;
  source: {
    type: string;
    company: string;
    holder_name: string;
  };
  created_at: string;
  url: string;
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
  callback_url?: string;
}

export interface PaymentIntentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  source: {
    type: string;
    company: string;
    holder_name: string;
  };
  url: string;
}

/**
 * Create a payment with Moyasar
 */
export async function createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  const credentials = `${MOYASAR_CONFIG.secretKey}:`;
  const encodedCredentials = btoa(credentials);
  const basicAuth = `Basic ${encodedCredentials}`;

  const response = await fetch(`${MOYASAR_CONFIG.apiUrl}payments`, {
    method: 'POST',
    headers: {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(paymentData.amount * 100), // Convert to smallest currency unit (e.g., fils for SAR)
      currency: paymentData.currency,
      source: {
        type: paymentData.source.type,
        number: paymentData.source.number,
        cvc: paymentData.source.cvc,
        month: paymentData.source.month,
        year: paymentData.source.year,
        holder_name: paymentData.source.holder_name,
      },
      description: paymentData.description,
      metadata: paymentData.metadata,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Moyasar payment creation failed: ${errorData}`);
  }

  return await response.json();
}

/**
 * Create a payment intent with Moyasar
 */
export async function createPaymentIntent(paymentData: PaymentIntentRequest): Promise<PaymentIntentResponse> {
  const credentials = `${MOYASAR_CONFIG.secretKey}:`;
  const encodedCredentials = btoa(credentials);
  const basicAuth = `Basic ${encodedCredentials}`;

  const response = await fetch(`${MOYASAR_CONFIG.apiUrl}payment-intents`, {
    method: 'POST',
    headers: {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(paymentData.amount * 100), // Convert to smallest currency unit (e.g., fils for SAR)
      currency: paymentData.currency,
      description: paymentData.description,
      metadata: paymentData.metadata,
      ...(paymentData.callback_url && { callback_url: paymentData.callback_url }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Moyasar payment intent creation failed: ${errorData}`);
  }

  return await response.json();
}

/**
 * Retrieve a payment by ID from Moyasar
 */
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const credentials = `${MOYASAR_CONFIG.secretKey}:`;
  const encodedCredentials = btoa(credentials);
  const basicAuth = `Basic ${encodedCredentials}`;

  const response = await fetch(`${MOYASAR_CONFIG.apiUrl}payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Moyasar payment retrieval failed: ${errorData}`);
  }

  return await response.json();
}

/**
 * Verify a payment with Moyasar
 */
export async function verifyPayment(paymentId: string): Promise<PaymentResponse> {
  const credentials = `${MOYASAR_CONFIG.secretKey}:`;
  const encodedCredentials = btoa(credentials);
  const basicAuth = `Basic ${encodedCredentials}`;

  const response = await fetch(`${MOYASAR_CONFIG.apiUrl}payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Moyasar payment verification failed: ${errorData}`);
  }

  return await response.json();
}

/**
 * Process Moyasar webhook
 */
export async function processWebhook(payload: string, signature: string) {
  // For production, implement proper signature verification
  // This is a simplified version. In production, you should use your secret key
  // to verify the signature to ensure the webhook is from Moyasar
  console.log("Processing Moyasar webhook:", payload);

  // Parse the webhook payload
  const data = JSON.parse(payload);

  // Handle the payment event based on its type
  switch (data.event) {
    case 'payment.succeeded':
      // Payment succeeded - update your database
      console.log("Payment succeeded:", data.payment.id);

      // Extract user ID and plan info from payment metadata
      const { user_id, plan_id } = data.payment.metadata || {};

      if (user_id && plan_id) {
        // Update user profile to premium
        const supabase = await import("@/lib/supabase/server").then(mod => mod.createClient());

        const now = new Date();
        const expiresAt = new Date(now);

        // Calculate premium expiration date based on plan
        if (plan_id === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (plan_id === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          throw new Error(`Invalid plan_id: ${plan_id}`);
        }

        // Update user profile to premium
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            premium_expires_at: expiresAt.toISOString(),
          })
          .eq("id", user_id);

        if (profileUpdateError) {
          console.error("Failed to update premium status:", profileUpdateError);
          throw new Error(`Failed to update premium status: ${profileUpdateError.message}`);
        }

        // Record or update the subscription
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id,
            plan: plan_id,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: expiresAt.toISOString(),
            moyasar_payment_id: data.payment.id,
          }, { onConflict: ['user_id'] });

        if (subscriptionError) {
          console.error("Failed to record subscription:", subscriptionError);
          throw new Error(`Failed to record subscription: ${subscriptionError.message}`);
        }

        // Record the payment
        const { error: paymentError } = await supabase
          .from("payments")
          .upsert({
            user_id,
            amount: data.payment.amount / 100, // Convert from halalas to SAR
            currency: data.payment.currency,
            status: "completed",
            payment_method: "moyasar",
            moyasar_payment_id: data.payment.id,
          }, { onConflict: ['moyasar_payment_id'] });

        if (paymentError) {
          console.error("Failed to record payment:", paymentError);
          throw new Error(`Failed to record payment: ${paymentError.message}`);
        }

        console.log(`Premium status updated successfully for user ${user_id}`);
      } else {
        console.log("Payment succeeded but no user_id or plan_id in metadata");
      }
      break;
    case 'payment.failed':
      // Payment failed - handle failure appropriately
      console.log("Payment failed:", data.payment.id);
      break;
    case 'payment.processing':
      // Payment is being processed
      console.log("Payment processing:", data.payment.id);
      break;
    case 'payment.refunded':
      // Payment was refunded - update user status accordingly
      console.log("Payment refunded:", data.payment.id);

      const { user_id: refunded_user_id } = data.payment.metadata || {};
      if (refunded_user_id) {
        const supabase = await import("@/lib/supabase/server").then(mod => mod.createClient());

        // Update user profile to non-premium
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            premium_expires_at: null,
          })
          .eq("id", refunded_user_id);

        if (profileUpdateError) {
          console.error("Failed to update premium status after refund:", profileUpdateError);
        }

        // Update subscription status
        const { error: subscriptionError } = await supabase
          .from("subscriptions")
          .update({
            status: "refunded",
          })
          .eq("moyasar_payment_id", data.payment.id);

        if (subscriptionError) {
          console.error("Failed to update subscription status after refund:", subscriptionError);
        }

        console.log(`Premium status removed after refund for user ${refunded_user_id}`);
      }
      break;
    case 'payment.captured':
      // Payment captured successfully
      console.log("Payment captured:", data.payment.id);
      break;
    default:
      console.log("Unknown event type:", data.event);
  }

  return { processed: true };
}