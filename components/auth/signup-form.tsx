"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Star, Award, Sparkles } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("Saudi Arabia")
  const [idType, setIdType] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const locations = [
    "Saudi Arabia",
    "United Arab Emirates",
    "Egypt",
    "Jordan",
    "Lebanon",
    "Morocco",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
    "Iraq",
    "Yemen",
    "Syria",
    "Palestine",
    "Tunisia",
    "Algeria",
    "Libya",
    "Sudan",
    "Other"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (!idType) {
      setError("Please select an ID type")
      setLoading(false)
      return
    }

    if (!idNumber) {
      setError("Please enter your ID number")
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone: phone,
          location: location,
          id_type: idType,
          id_number: idNumber,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If signup is successful, redirect to home page immediately
    if (data.session) {
      router.push("/")
      router.refresh()
    } else {
      // If no session but user exists (requires email confirmation),
      // we'll handle this differently since we removed email verification
      // We'll redirect to login instead
      setError("Account created! Please sign in with your credentials.")
      setLoading(false)
      setTimeout(() => {
        router.push("/login")
      }, 2000) // Redirect after 2 seconds
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // If success state is triggered, show a message and redirect automatically
  if (success) {
    return (
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-100/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-1/2 translate-y-1/2 blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-amber-300/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-lg"></div>

        <div className="space-y-6 text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Mail className="h-8 w-8 text-amber-700" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium italic">Welcome aboard!</h3>
            <p className="mt-2 text-muted-foreground italic">Your account has been created successfully.</p>
          </div>
          <div className="p-4 bg-amber-50/80 rounded-lg border border-amber-200 text-sm text-amber-800">
            <p className="flex items-start gap-2">
              <span className="inline-block mt-0.5">✅</span>
              <span className="italic">Redirecting to home page...</span>
            </p>
          </div>
        </div>
      </div>
    )
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium italic">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
          </div>

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
            <Label htmlFor="phone" className="text-sm font-medium italic">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+966 50 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium italic">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc} className="italic">{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idType" className="text-sm font-medium italic">
              ID Type
            </Label>
            <Select value={idType} onValueChange={setIdType}>
              <SelectTrigger id="idType" className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id" className="italic">National ID Card</SelectItem>
                <SelectItem value="passport" className="italic">Passport</SelectItem>
                <SelectItem value="commercial_register" className="italic">Commercial Register</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-sm font-medium italic">
              {idType === "national_id" ? "ID Card Number" :
               idType === "passport" ? "Passport Number" :
               "Commercial Register Number"}
            </Label>
            <Input
              id="idNumber"
              type="text"
              placeholder={idType === "national_id" ? "1234567890" :
                          idType === "passport" ? "P12345678" :
                          "CR-123456"}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              className="h-12 rounded-none border-border bg-background/50 backdrop-blur-sm px-4 italic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium italic">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium italic">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
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
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-muted-foreground italic">New customer?</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-muted-foreground italic">Create your account</span>
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-none text-sm font-medium tracking-wide italic" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs italic">Secure registration</span>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span className="text-muted-foreground text-xs italic">Protected by Supabase security</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground italic">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-foreground italic">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-foreground italic">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  )
}
