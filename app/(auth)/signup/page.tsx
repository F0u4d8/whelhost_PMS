import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

const benefits = [
  "14-day complimentary trial",
  "No payment information required",
  "Complete access to all features",
  "Cancel at any time",
]

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-secondary/30 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
        </Link>

        <div className="space-y-10">
          <div>
            <h2 className="font-serif text-4xl font-medium leading-tight text-foreground">
              Begin your journey to exceptional hospitality
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Join the community of discerning hoteliers who have elevated their operations with WhelHost.
            </p>
          </div>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-4 text-foreground/80">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">Trusted by over 500 distinguished properties worldwide</p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-12 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-3xl font-medium">Create your account</h1>
            <p className="mt-3 text-muted-foreground">Begin your 14-day complimentary trial</p>
          </div>

          <SignupForm />

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
