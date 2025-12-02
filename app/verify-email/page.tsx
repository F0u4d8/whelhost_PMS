import { ResendVerificationEmail } from "@/components/auth/resend-verification-email";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already verified, redirect to home page
  if (user?.email_confirmed_at) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-6">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="font-serif text-3xl font-medium">Verify Your Email</h1>
          <p className="mt-4 text-muted-foreground">
            We've sent a verification link to <span className="font-medium">{user?.email}</span>.
            Please click the link in the email to activate your account.
          </p>
        </div>

        <div className="p-6 bg-amber-50/80 rounded-lg border border-amber-200">
          <h2 className="font-medium text-amber-900 mb-2">Didn't receive the email?</h2>
          <p className="text-sm text-amber-800 mb-4">
            Check your spam folder or click the button below to resend the verification email.
          </p>
          <ResendVerificationEmail />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Once verified, you'll be automatically redirected to your home page.</p>
        </div>
      </div>
    </div>
  );
}