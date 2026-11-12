import { sessionClient } from "../../../../lib/supabase";
import { json } from "../../../../lib/http";
export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id))
    return json({ error: "File not found." }, 404);
  const client = await sessionClient();
  if (!client) return json({ error: "File not found." }, 404);
  const { data: media } = await client
    .from("cms_media")
    .select("path,name,mime")
    .eq("id", id)
    .maybeSingle();
  if (!media) return json({ error: "File not found." }, 404);
  const download = new URL(request.url).searchParams.get("download") === "1";
  const { data, error } = await client.storage
    .from("company-media")
    .createSignedUrl(
      media.path,
      300,
      download
        ? {
            download: `${media.name.replace(/[^a-zA-Z0-9 _-]/g, "") || "loan-application"}.pdf`,
          }
        : undefined,
    );
  if (error || !data?.signedUrl)
    return json({ error: "This file is temporarily unavailable." }, 404);
  return new Response(null, {
    status: 302,
    headers: {
      Location: data.signedUrl,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
