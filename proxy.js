import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Proxy Next.js 16 untuk memproteksi rute /admin.
 * Mengalihkan pengunjung yang belum login ke /admin/login.
 */
export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KE;

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!supabaseUrl || !supabasePublishableKey) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  } catch {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export default proxy;

