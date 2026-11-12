// Only a publishable/anon key is accepted. A service key would bypass RLS.
export function validateConfiguration(url, key) {
  if (!url || !key) return null;
  key = key.trim();
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) return null;
  } catch {
    return null;
  }
  if (key.startsWith("sb_secret_")) return null;
  if (key.split(".").length === 3) {
    try {
      const claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
      if (claims.role === "service_role") return null;
    } catch {
      return null;
    }
  }
  return { url, key };
}
export function configuration() {
  return validateConfiguration(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY,
  );
}
