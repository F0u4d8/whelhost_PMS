import { createServerClient } from "@supabase/ssr";
import { createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client that works in both server and client components.
 * In server components, it uses server-side cookies for auth persistence.
 * In client components, it uses browser storage for auth persistence.
 */
export function createClient() {
  // Check if we're in a server context
  if (typeof window === "undefined") {
    // Server context - we're in a server component
    try {
      // Attempt to get cookies from the server
      const cookieStore = cookies();
      
      return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Server Component - ignore
              }
            },
          },
        }
      );
    } catch (error) {
      // If cookies is not available (might be in a different server context)
      // fallback to browser client
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  } else {
    // Client context - we're in a client component
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}