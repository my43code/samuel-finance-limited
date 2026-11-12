import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { configuration } from "./config";
export { configuration } from "./config";

export function publicClient() {
  const config = configuration();
  return config
    ? createClient(config.url, config.key, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
}
export async function sessionClient() {
  const config = configuration();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          for (const { name, value, options } of values)
            jar.set(name, value, options);
        } catch {
          /* Proxy refreshes cookies for server-rendered pages. */
        }
      },
    },
  });
}
export async function administrator() {
  const client = await sessionClient();
  if (!client) return null;
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await client
    .from("cms_admins")
    .select("user_id,display_name,role")
    .eq("user_id", user.id)
    .maybeSingle();
  return profile ? { client, user, profile } : null;
}
