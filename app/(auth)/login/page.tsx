import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-secondary/30 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
        </Link>

        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img src="/luxury-hotel-lobby-with-marble-floors-and-chandeli.jpg" alt="Luxury hotel lobby" className="h-full w-full object-cover" />
        </div>

        <div>
          <blockquote className="space-y-4">
            <p className="font-serif text-xl leading-relaxed text-foreground/80 italic">
              "WhelHost has completely transformed how we manage our boutique hotel. The intuitive design and powerful
              features have elevated our guest experience."
            </p>
            <footer className="text-sm text-muted-foreground">
              <cite className="font-medium text-foreground not-italic">Ahmed Al-Rashid</cite>
              <span className="mx-2">—</span>
              <span>General Manager, Riyadh Grand Hotel</span>
            </footer>
          </blockquote>
        </div>
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
            <h1 className="font-serif text-3xl font-medium">Welcome back</h1>
            <p className="mt-3 text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <LoginForm />

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
