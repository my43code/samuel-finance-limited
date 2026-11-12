import { publicClient } from "./supabase";
import { companyDefaults } from "./defaults";
export async function publicData() {
  const client = publicClient();
  if (!client) return { company: companyDefaults, entries: [], leadership: [] };
  try {
    const [company, entries, leadership] = await Promise.all([
      client
        .from("cms_company")
        .select("content")
        .eq("id", "published")
        .maybeSingle(),
      client
        .from("cms_entries")
        .select("*,media:cms_media(id,mime,alt_text)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(150),
      client
        .from("cms_leadership")
        .select("*,media:cms_media(id,mime,alt_text)")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);
    if (company.error || entries.error || leadership.error)
      console.error("Public CMS content unavailable");
    return {
      company: { ...companyDefaults, ...(company.data?.content || {}) },
      entries: entries.data || [],
      leadership: leadership.data || [],
    };
  } catch {
    return { company: companyDefaults, entries: [], leadership: [] };
  }
}
export async function publicEntry(id, kind) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
  const client = publicClient();
  if (!client) return null;
  const { data } = await client
    .from("cms_entries")
    .select("*,media:cms_media(id,mime,alt_text)")
    .eq("id", id)
    .eq("kind", kind)
    .eq("status", "published")
    .maybeSingle();
  return data;
}
