import "server-only";
import { publicClient } from "./supabase";

// Discovery is independent of the shorter lists used by the homepage.
export async function publicDiscoveryEntries() {
  const client = publicClient();
  if (!client) return [];
  const entries = [];
  const batchSize = 500;
  try {
    for (let offset = 0; ; offset += batchSize) {
      const { data, error } = await client
        .from("cms_entries")
        .select("id,kind,title,status,media_id,published_at,updated_at")
        .eq("status", "published")
        .order("id", { ascending: true })
        .range(offset, offset + batchSize - 1);
      if (error) {
        console.error("Public page discovery unavailable");
        return entries;
      }
      entries.push(...(data || []));
      if (!data || data.length < batchSize) return entries;
    }
  } catch {
    console.error("Public page discovery unavailable");
    return entries;
  }
}
