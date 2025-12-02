import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, Star, Award, Sparkles, User, Crown, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoomsSection } from "@/components/rooms/rooms-section"
import { createClient } from "@/lib/supabase/server"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/dashboard/upgrade" },
  { name: "Support", href: "#support" },
]

const packages = [
  {
    name: "Romantic Escape",
    description: "Champagne, roses, and spa treatments for two",
    features: ["2-night stay", "Couples massage", "Private dinner", "Late checkout"],
    icon: "💕",
  },
  {
    name: "Business Elite",
    description: "Everything you need for productive stays",
    features: ["Airport transfer", "Meeting room access", "Express laundry", "24/7 concierge"],
    icon: "💼",
  },
  {
    name: "Family Adventure",
    description: "Create memories that last forever",
    features: ["Connecting rooms", "Kids activities", "Family dining", "City tour included"],
    icon: "👨‍👩‍👧‍👦",
  },
]

const stats = [
  { value: "500+", label: "Hotels Trust Us" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24/7", label: "Premium Support" },
]

export default async function HomePage() {
  let user = null;
  let userProfile = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    // Fetch user profile if user exists
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      userProfile = profileData;
    }
  } catch (error) {
    // If there's an error getting the user or profile, continue without user info
    console.log("No authenticated user or error fetching profile:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-12 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons - Different based on auth status */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              // User is logged in - show profile dropdown
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>

                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 border rounded-full px-1 py-1.5 text-sm hover:bg-accent transition-colors focus:outline-none"
                      aria-label="Profile menu"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt={userProfile.full_name || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {userProfile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-warning" />
                        <span>Upgrade to Pro</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/logout" className="flex items-center gap-2 text-destructive">
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // User is not logged in - show auth buttons
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="rounded-lg bg-amber-800 hover:bg-amber-700 px-6">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
              <nav className="mt-12 flex flex-col gap-6">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} className="font-serif text-2xl font-medium text-foreground">
                    {item.name}
                  </Link>
                ))}
                <div className="mt-8 flex flex-col gap-4">
                  {user ? (
                    // User is logged in - show profile options
                    <>
                      <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>

                      {/* Profile Options in Mobile */}
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-amber-800/30">
                          <Link href="/profile">Profile</Link>
                        </Button>
                        <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-amber-800/30">
                          <Link href="/dashboard/upgrade">Upgrade to Pro</Link>
                        </Button>
                        <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-red-700/30 text-red-600">
                          <Link href="/logout">Sign Out</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    // User is not logged in - show auth buttons
                    <>
                      <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild className="rounded-lg bg-amber-800 hover:bg-amber-700">
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-100/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-amber-100/80 text-amber-800 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Luxury Hotel Management</span>
            </div>

            <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <span className="italic">Exceptional hospitality</span> <span className="text-amber-700">meets</span> <span className="italic">elegant design</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Transform your hotel operations with our refined property management system. Designed for hoteliers who
              demand excellence in every detail.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="group gap-2 rounded-lg bg-amber-800 hover:bg-amber-700 px-8 py-6 text-base">
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-lg px-8 py-6 text-base border-2">
                <Link href="/rooms">Explore Rooms</Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-600" />
                <span>5-Star Rating</span>
              </div>
              <div className="h-2 w-px bg-border"></div>
              <div>Trusted by 500+ Hotels</div>
              <div className="h-2 w-px bg-border"></div>
              <div>24/7 Support</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Scroll</span>
            <div className="h-12 w-px bg-border" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-amber-50/50 py-16 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-4xl font-medium lg:text-5xl text-amber-700">{stat.value}</div>
                <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RoomsSection />

      {/* Feature Banner */}
      <section className="bg-gradient-to-r from-amber-800 to-amber-900 py-24 text-primary-foreground lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <span className="text-sm uppercase tracking-widest text-white/70 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Why WhelHost
              </span>
              <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl text-white">
                Streamline your operations with <span className="italic">precision</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/80 italic">
                Our comprehensive suite of tools empowers your team to deliver exceptional service while maximizing
                efficiency and revenue.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Real-time booking management",
                  "Intelligent revenue optimization",
                  "Seamless guest communication",
                  "Integrated payment processing",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-white italic">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="secondary" asChild className="mt-10 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-50 px-8 text-white">
                <Link href="/dashboard">Access Dashboard</Link>
              </Button>
            </div>
            <div className="aspect-square bg-primary-foreground/10 rounded-2xl lg:aspect-[4/3] overflow-hidden">
              <img src="/luxury-hotel-lobby-interior-elegant-modern.jpg" alt="Hotel lobby" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Exclusive <span className="italic">Offers</span>
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">Tailored Packages</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              Curated experiences designed to exceed every expectation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {packages.map((pkg, index) => (
              <div
                key={pkg.name}
                className={`border border-border/40 p-8 transition-all duration-300 hover:border-amber-700/50 rounded-xl ${
                  index === 1 ? "bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-950/10 border-amber-800/40 relative overflow-hidden" : "bg-background"
                }`}
              >
                {index === 1 && (
                  <div className="absolute top-0 right-0 bg-amber-700 text-white px-4 py-1 text-xs font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className="text-3xl mb-4">{pkg.icon}</div>
                <h3 className="font-serif text-2xl font-medium italic">{pkg.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
                <ul className="mt-8 space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={index === 1 ? "default" : "outline"} asChild className={`mt-8 w-full rounded-lg ${index === 1 ? "bg-amber-800 hover:bg-amber-700" : "border-amber-800/30"}`}>
                  <Link href="/signup">Learn More</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="border-t border-border/40 bg-amber-50/30 py-24 lg:py-32 dark:bg-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Star className="h-4 w-4 fill-current" />
              Support
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">We are here to help</h2>
            <p className="mt-6 text-lg text-muted-foreground italic">
              Our dedicated support team is available around the clock to ensure your success. From onboarding to
              optimization, we are with you every step of the way.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="rounded-lg bg-amber-800 hover:bg-amber-700 px-8">
                <Link href="mailto:support@whelhost.com">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-lg border-2 border-amber-800/30">
                <Link href="/docs">Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-950/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center bg-background/80 backdrop-blur-sm p-12 rounded-2xl border border-border/30">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
              <Sparkles className="h-4 w-4 fill-current" />
              <span>Limited Time Offer</span>
            </div>

            <h2 className="font-serif text-4xl font-medium tracking-tight lg:text-5xl">
              Ready to elevate your <span className="italic">hospitality</span>?
            </h2>
            <p className="mt-6 text-lg text-muted-foreground italic">
              Join the community of forward-thinking hoteliers who have transformed their operations with WhelHost.
            </p>
            <Button size="lg" asChild className="mt-10 gap-2 rounded-lg bg-amber-800 hover:bg-amber-700 px-10 py-6 text-base">
              <Link href="/signup">
                Begin Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm">4.9/5 from 247 reviews</span>
              </div>
              <div className="h-4 w-px bg-border/50"></div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Best in class</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-600" />
                <span className="font-serif text-xl font-medium">WhelHost</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground italic">Luxury hotel management, redefined.</p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms
              </Link>
            </nav>
          </div>

          <div className="mt-12 border-t border-border/40 pt-8 text-center">
            <p className="text-sm text-muted-foreground italic">{new Date().getFullYear()} WhelHost. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
