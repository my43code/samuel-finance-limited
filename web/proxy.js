import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { configuration } from "./lib/config";
export async function proxy(request) {
  if (
    process.env.SITE_URL &&
    (request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/auth"))
  ) {
    const canonical = new URL(process.env.SITE_URL);
    const alternate = canonical.hostname.startsWith("www.")
      ? canonical.hostname.slice(4)
      : "www." + canonical.hostname;
    if (request.nextUrl.hostname === alternate)
      return NextResponse.redirect(
        new URL(
          request.nextUrl.pathname + request.nextUrl.search,
          canonical.origin,
        ),
      );
  }
  let response = NextResponse.next({ request });
  const settings = configuration();
  if (!settings) return response;
  const { url, key } = settings;
  const supabase = createServerClient(url, key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values)
          response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/media/:path*",
    "/api/auth/:path*",
    "/auth/:path*",
  ],
};
