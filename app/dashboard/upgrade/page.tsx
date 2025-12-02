import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Crown } from "lucide-react"
import Link from "next/link"

const features = [
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

export default async function UpgradePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("id", user.id)
    .single()

  if (profile?.is_premium) {
    const expiresAt = profile.premium_expires_at ? new Date(profile.premium_expires_at) : null

    if (!expiresAt || expiresAt > new Date()) {
      redirect("/dashboard")
    }
  }

  return (
    <div className="mx-auto max-w-5xl py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
          <Crown className="h-6 w-6 text-accent" />
        </div>
        <h1 className="font-serif text-4xl font-medium">Upgrade to Premium</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Unlock the full potential of WhelHost and transform your hotel operations
        </p>
      </div>

      {/* Special Promotion Banner */}
      <div className="mb-8 rounded-lg border-2 border-white bg-amber-700 p-6 text-center text-white">
        <h2 className="font-serif text-2xl font-medium">Special Limited Time Offer</h2>
        <p className="mt-2 text-lg">Get Premium for only <span className="font-serif text-3xl font-medium">SAR 1.99</span> for the first month!</p>
        <p className="mt-1 text-sm opacity-90">Then regular pricing applies. Limited time offer.</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Monthly Plan */}
        <div className="border border-border p-8 transition-colors hover:border-foreground/50">
          <div>
            <h2 className="font-serif text-2xl font-medium">Monthly</h2>
            <p className="mt-1 text-sm text-muted-foreground">Perfect for getting started</p>
          </div>

          <div className="mt-6">
            <span className="font-serif text-5xl font-medium">199</span>
            <span className="ml-2 text-muted-foreground">SAR/month</span>
          </div>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button asChild className="mt-10 w-full rounded-none py-6">
            <Link href="/checkout?plan=monthly">Subscribe Monthly</Link>
          </Button>
        </div>

        {/* Yearly Plan */}
        <div className="relative border-2 border-foreground p-8">
          <div className="absolute -top-3 left-6 bg-background px-3">
            <span className="text-xs font-medium uppercase tracking-wider">Best Value</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-medium">Yearly</h2>
            <p className="mt-1 text-sm text-muted-foreground">Save 16% compared to monthly</p>
          </div>

          <div className="mt-6">
            <span className="font-serif text-5xl font-medium">1,990</span>
            <span className="ml-2 text-muted-foreground">SAR/year</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Equivalent to 166 SAR/month</p>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button asChild className="mt-10 w-full rounded-none py-6">
            <Link href="/checkout?plan=yearly">Subscribe Yearly</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Secure payment powered by Moyasar. Cancel anytime with no questions asked.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions?{" "}
          <Link href="mailto:support@whelhost.com" className="underline underline-offset-4 hover:text-foreground">
            Contact our team
          </Link>
        </p>
      </div>
    </div>
  )
}
