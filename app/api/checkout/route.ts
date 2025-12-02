import { createClient } from "@/lib/supabase/server"
import { PLANS, type PlanId } from "@/lib/moyasar"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const plan = searchParams.get("plan") as PlanId | null

  if (!plan || !PLANS[plan]) {
    return NextResponse.redirect(new URL("/dashboard/upgrade", request.url))
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to checkout page with plan
  return NextResponse.redirect(new URL(`/checkout?plan=${plan}`, request.url))
}
