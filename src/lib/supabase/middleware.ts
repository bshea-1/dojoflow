import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected Routes Logic
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Franchise Context Check
    // If user is at /dashboard (root), redirect to /dashboard/[slug]
    if (request.nextUrl.pathname === "/dashboard") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("franchises (slug)")
        .eq("id", user.id)
        .single();

      // Type assertion/safety check needed here as generic types might be tricky with joins
      const slug = (profile as any)?.franchises?.slug;

      if (slug) {
        return NextResponse.redirect(
          new URL(`/dashboard/${slug}`, request.url)
        );
      }
    }
  }

  // Auth Routes Logic (Redirect logged in users away from login)
  if (request.nextUrl.pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

