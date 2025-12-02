import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PLANS, type PlanId } from "@/lib/moyasar"
import { MoyasarCheckoutForm } from "@/components/checkout/moyasar-form"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const planId = params.plan as PlanId | undefined

  if (!planId || !PLANS[planId]) {
    redirect("/dashboard/upgrade")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

  const plan = PLANS[planId]
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/callback`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-serif text-xl font-medium">
            WhelHost
          </Link>
          <Link
            href="/dashboard/upgrade"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to plans
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Order Summary */}
          <div>
            <h1 className="font-serif text-3xl font-medium">Complete your subscription</h1>
            <p className="mt-2 text-muted-foreground">You are subscribing to WhelHost Premium</p>

            <div className="mt-8 border border-border bg-secondary/20 p-6">
              <h2 className="font-medium">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Subscription</span>
                  <span>
                    {plan.displayPrice} SAR/{plan.period}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="font-medium">Total due today</span>
                  <span className="font-serif text-2xl font-medium">{plan.displayPrice} SAR</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span>Secure payment powered by Moyasar. Your data is encrypted.</span>
            </div>

            <div className="mt-8">
              <h3 className="font-medium">What is included:</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Unlimited rooms and units management
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Real-time booking calendar
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Advanced analytics and reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Smart lock integration
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Guest communication tools
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-foreground" />
                  Invoice generation and payments
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <div className="border border-border bg-card p-8">
              <h2 className="font-serif text-xl font-medium">Payment details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your card information to complete the subscription
              </p>

              <div className="mt-8">
                <MoyasarCheckoutForm
                  amount={plan.amount}
                  description={plan.description}
                  callbackUrl={callbackUrl}
                  metadata={{
                    user_id: user.id,
                    plan_id: planId,
                    user_email: profile?.email || user.email || "",
                  }}
                />
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By subscribing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
