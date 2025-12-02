import { createClient } from "@/lib/supabase/server"
import { verifyPayment, PLANS, type PlanId } from "@/lib/moyasar"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"

interface CallbackPageProps {
  searchParams: Promise<{
    id?: string
    status?: string
    message?: string
  }>
}

export default async function PaymentCallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams
  const paymentId = params.id
  const status = params.status

  if (!paymentId) {
    redirect("/dashboard/upgrade")
  }

  // Verify the payment with Moyasar
  const payment = await verifyPayment(paymentId)

  if (!payment) {
    return <PaymentError message="Unable to verify payment. Please contact support." />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if payment was successful
  if (payment.status === "paid") {
    const planId = payment.metadata?.plan_id as PlanId
    const plan = planId && PLANS[planId]

    if (!plan) {
      return <PaymentError message="Invalid subscription plan. Please contact support." />
    }

    // Calculate premium expiration date
    const now = new Date()
    const expiresAt = new Date(now)
    if (planId === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    }

    // Update user profile to premium
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update premium status:", updateError)
      return <PaymentError message="Payment successful but failed to activate premium. Please contact support." />
    }

    // Record the subscription
    await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan: planId,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: expiresAt.toISOString(),
      moyasar_payment_id: paymentId,
    })

    // Record the payment
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: payment.amount / 100, // Convert from halalas to SAR
      currency: payment.currency,
      status: "completed",
      payment_method: "moyasar",
      moyasar_payment_id: paymentId,
    })

    return <PaymentSuccess planName={plan.name} />
  }

  // Payment failed
  return <PaymentError message={params.message || "Payment was not completed. Please try again."} />
}

function PaymentSuccess({ planName }: { planName: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>

        <h1 className="font-serif text-3xl font-medium">Payment Successful</h1>
        <p className="mt-4 text-muted-foreground">
          Thank you for subscribing to {planName}. Your premium features are now active.
        </p>

        <Button asChild className="mt-8 gap-2 rounded-none px-8">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function PaymentError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="font-serif text-3xl font-medium">Payment Failed</h1>
        <p className="mt-4 text-muted-foreground">{message}</p>

        <div className="mt-8 flex flex-col gap-4">
          <Button asChild className="gap-2 rounded-none">
            <Link href="/dashboard/upgrade">Try Again</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-none bg-transparent">
            <Link href="mailto:support@whelhost.com">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
