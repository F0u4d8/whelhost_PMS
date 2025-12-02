// lib/moyasar-config.ts

// Define configuration constants
export const MOYASAR_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
  secretKey: process.env.MOYASAR_SECRET_KEY,
  currency: process.env.MOYASAR_CURRENCY || "SAR",
  supportedNetworks: ["visa", "mastercard", "mada"] as const,
};