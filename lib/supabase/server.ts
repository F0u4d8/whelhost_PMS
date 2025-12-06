import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  try {
    const cookieStore = cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            'Cache-Control': 'no-cache'
          }
        },
        cookies: {
          get: (name: string) => {
            try {
              return cookieStore.get(name)?.value;
            } catch {
              return undefined;
            }
          },
          set: (name: string, value: string, options: any) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server component - ignore during static generation
            }
          },
          remove: (name: string, options: any) => {
            try {
              cookieStore.set(name, "", { ...options, maxAge: -1 });
            } catch {
              // Server component - ignore during static generation
            }
          },
          getAll: () => {
            try {
              return cookieStore.getAll();
            } catch {
              // If cookies.getAll is not available during static generation, return empty array
              return [];
            }
          },
        },
      }
    );
  } catch {
    // Fallback for static generation phase
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
          getAll: () => [],
        }
      }
    );
  }
}
