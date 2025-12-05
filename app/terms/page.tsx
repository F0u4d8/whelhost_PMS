import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-6">
        <div className="container mx-auto px-4">
          <Link href="/">
            <Button variant="outline" className="border-amber-800/30">
              Return Home
            </Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-medium mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Please read these terms carefully before using our services.
          </p>
        </div>

        <div className="prose prose-amber dark:prose-invert max-w-none">
          <h2 className="font-serif text-2xl font-medium">Acceptance of Terms</h2>
          <p>
            By accessing and using our hotel reservation platform, you accept and agree to be bound 
            by these Terms of Service and our Privacy Policy. If you disagree with any part of these 
            terms, you may not access the service.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password 
            and for restricting access to your computer. You agree to accept responsibility for 
            all activities that occur under your account or password.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Reservation Policy</h2>
          <p>
            All reservations made through our platform are subject to availability and 
            confirmation. Payment is required at the time of booking unless otherwise specified. 
            Cancellation policies vary by property and will be clearly stated during the booking process.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Limitation of Liability</h2>
          <p>
            In no event shall WhelHost, nor its directors, employees, partners, agents, suppliers, 
            or affiliates, be liable for any indirect, incidental, special, consequential or 
            punitive damages, including without limitation, loss of profits, data, use, goodwill, 
            or other intangible losses.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective 
            immediately upon posting to our website. Your continued use of the service after 
            changes have been posted will constitute your acceptance of such changes.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at 
            <a href="mailto:legal@whelhost.com" className="text-amber-600 hover:underline ml-1">legal@whelhost.com</a>.
          </p>
        </div>
      </main>
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} WhelHost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}