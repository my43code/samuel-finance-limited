import { sessionClient } from "../../../lib/supabase";
export async function GET(request) {
  const url = new URL(request.url);
  const base = process.env.SITE_URL || url.origin;
  const code = url.searchParams.get("code");
  const client = await sessionClient();
  if (code && client) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return Response.redirect(new URL("/admin/reset-password", base), 303);
  }
  return Response.redirect(new URL("/admin/login?recovery=expired", base), 303);
}
