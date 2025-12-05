import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Sparkles, Star, Users, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

export default function UpgradePage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small properties getting started",
      features: [
        "Up to 10 rooms",
        "Basic reservation management",
        "Guest communication",
        "Monthly reports",
        "Email support"
      ],
      cta: "Current Plan",
      mostPopular: false
    },
    {
      name: "Professional",
      price: "SAR 299/month",
      description: "Ideal for growing properties",
      features: [
        "Unlimited rooms",
        "Advanced reporting",
        "Channel manager",
        "Smart locks integration",
        "Priority support",
        "Custom invoices",
        "Owner statements"
      ],
      cta: "Upgrade Now",
      mostPopular: true
    },
    {
      name: "Enterprise",
      price: "SAR 799/month",
      description: "For large operations",
      features: [
        "All Professional features",
        "Multi-property support",
        "Advanced analytics",
        "Custom integrations",
        "24/7 dedicated support",
        "API access",
        "Custom development"
      ],
      cta: "Contact Sales",
      mostPopular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-800 px-4 py-2 mb-4 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4 fill-current" />
            <span>Unlock Premium Features</span>
          </div>
          <h1 className="font-serif text-4xl font-medium mb-4">Upgrade Your Account</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your hotel management to the next level with our premium features designed for efficiency and growth.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative overflow-hidden ${plan.mostPopular ? "border-2 border-amber-600 ring-2 ring-amber-500/20" : ""}`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 bg-amber-600 text-white px-4 py-1 text-xs font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  {index === 1 ? <Crown className="h-5 w-5 text-amber-600" /> : 
                   index === 2 ? <Star className="h-5 w-5 text-amber-600" /> : 
                   <Users className="h-5 w-5 text-amber-600" />}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.name !== "Starter" && <span className="text-muted-foreground">/month</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.mostPopular ? "bg-amber-600 hover:bg-amber-700" : ""}`} 
                  variant={plan.mostPopular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl font-medium mb-8 text-center">Premium Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Advanced Payments</h3>
              <p className="text-muted-foreground">Accept payments online, process refunds, and manage payment methods.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Security & Compliance</h3>
              <p className="text-muted-foreground">Enterprise-grade security with PCI DSS compliance for payments.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-xl border border-border/40">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Multi-User Access</h3>
              <p className="text-muted-foreground">Invite team members with role-based permissions.</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <Button size="lg" className="bg-amber-800 hover:bg-amber-700">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}