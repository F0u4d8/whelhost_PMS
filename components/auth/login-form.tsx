"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Star, Award, Sparkles } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Check if the error is related to email not being confirmed
      if (error.message.includes("email") && error.message.includes("confirmed")) {
        setError("Please verify your email address before signing in. Check your inbox for a confirmation email.")
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    // Check if user email is confirmed
    if (data?.user && !data.user.email_confirmed_at) {
      setError("Please verify your email address before signing in. Check your inbox for a confirmation email.")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
          <Label htmlFor="email" className="text-sm font-medium italic">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium italic">
              Password
            </Label>
            <Button
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground italic"
              type="button"
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 pr-12 italic"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-muted-foreground italic">Returning customer?</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground italic">Sign in to your account</span>
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-none text-sm font-medium tracking-wide italic" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs italic">Secure authentication</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span className="text-muted-foreground text-xs italic">Protected by Supabase security</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground italic">
          Didn't receive the confirmation email?{" "}
          <Button
            variant="link"
            className="h-auto p-0 text-sm text-foreground underline italic"
            type="button"
            onClick={async () => {
              const supabase = createClient();
              const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                  emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
                },
              });

              if (error) {
                setError("Failed to resend confirmation email: " + error.message);
              } else {
                setError("Confirmation email has been resent. Please check your inbox.");
              }
            }}
          >
            Resend it
          </Button>
        </p>
      </form>
    </div>
  )
}
