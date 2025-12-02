import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/dashboard/profile-card";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, hotelResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("hotels").select("*").eq("owner_id", user.id).single(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-12 md:flex">
            <a href="/" className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              Home
            </a>
            <a href="/dashboard" className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </a>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </a>
            <a href="/dashboard/profile" className="flex items-center gap-2 border rounded-full px-3 py-1.5 text-sm hover:bg-accent transition-colors">
              <span>Profile</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="space-y-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-amber-100/80 text-amber-800 text-sm font-medium">
              <span className="text-amber-700">👤</span>
              <span>Your Profile</span>
            </div>
            <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight sm:text-6xl">
              <span className="italic">Manage your</span> <span className="text-amber-700">Account</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground italic">
              Customize your personal information and secure your account settings
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-border/30">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-medium italic">Account Settings</h2>
                <p className="text-muted-foreground mt-2 italic">Update your personal details and preferences</p>
              </div>

              <ProfileCard user={user} profile={profileResult.data} hotel={hotelResult.data} />
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground italic">Need assistance? Our support team is available 24/7</p>
            <a href="/support" className="mt-4 inline-flex items-center gap-2 text-amber-700 hover:text-amber-600 font-medium italic">
              <span>Contact Support</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}