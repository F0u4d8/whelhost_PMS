// lib/moyasar-config.ts

// Define configuration constants
export const MOYASAR_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || "pk_live_WrJcXqsLLXJe82aYmENsdrqNtMV3cMsVfXp8hf3e",
  secretKey: process.env.MOYASAR_SECRET_KEY || "sk_live_VQiVB5JWk5NrSoupUaBfxnHSZYxQzMUnTvdvn3Xu",
  currency: process.env.MOYASAR_CURRENCY || "SAR",
  supportedNetworks: ["visa", "mastercard", "mada"] as const,
};