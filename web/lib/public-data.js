import { publicClient } from "./supabase";
import { companyDefaults } from "./defaults";
export async function publicData() {
  const client = publicClient();
  if (!client) return { company: companyDefaults, entries: [] };
  try {
    const [company, entries] = await Promise.all([
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
    ]);
    if (company.error || entries.error)
      console.error("Public CMS content unavailable");
    return {
      company: { ...companyDefaults, ...(company.data?.content || {}) },
      entries: entries.data || [],
    };
  } catch {
    return { company: companyDefaults, entries: [] };
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
