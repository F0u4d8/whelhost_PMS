import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="font-serif text-4xl font-medium mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        <div className="prose prose-amber dark:prose-invert max-w-none">
          <h2 className="font-serif text-2xl font-medium">Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            make a reservation, or contact us for support. This may include your name, email address, 
            payment information, and other details.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, send communications, and for other purposes related to our business.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Data Security</h2>
          <p>
            We implement appropriate security measures to protect against unauthorized access, 
            alteration, disclosure, or destruction of your personal information.
          </p>

          <h2 className="font-serif text-2xl font-medium mt-8">Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at 
            <a href="mailto:privacy@whelhost.com" className="text-amber-600 hover:underline ml-1">privacy@whelhost.com</a>.
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