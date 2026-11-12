import { requireAdmin, json, failure, checked } from "../../../../lib/http";
export async function GET(request) {
  try {
    const { client, user, profile } = await requireAdmin(request);
    const [entries, media, company, leadership, activity] = await Promise.all([
      client
        .from("cms_entries")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500),
      client
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      client.from("cms_company").select("*"),
      client
        .from("cms_leadership")
        .select("*,media:cms_media(id,mime,alt_text)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("cms_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);
    return json({
      entries: checked(entries),
      media: checked(media),
      company: checked(company),
      leadership: checked(leadership),
      activity: checked(activity),
      user: {
        email: user.email,
        name: profile.display_name || user.email.split("@")[0],
        role: profile.role,
      },
    });
  } catch (error) {
    return failure(error);
  }
}
