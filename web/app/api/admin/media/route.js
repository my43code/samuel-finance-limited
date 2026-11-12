import {
  requireAdmin,
  json,
  jsonBody,
  failure,
  checked,
  RequestError,
} from "../../../../lib/http";
import { detectedMime, fileLimit } from "../../../../lib/validation";
import { z } from "zod";
export async function POST(request) {
  try {
    const { client, user } = await requireAdmin(request);
    if (Number(request.headers.get("content-length")) > 52 * 1024 * 1024)
      throw new RequestError(
        413,
        "The upload is too large. Videos may be up to 50 MB.",
      );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 50 * 1024 * 1024)
      throw new RequestError(400, "Choose a file up to 50 MB.");
    const name = z.string().trim().min(3).max(160).parse(form.get("name"));
    const alt_text = z
      .string()
      .trim()
      .min(3, "Add a description of this file.")
      .max(300)
      .parse(form.get("alt_text"));
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = detectedMime(bytes);
    if (!mime)
      throw new RequestError(
        415,
        "Choose a JPEG, PNG, WebP, MP4, WebM or PDF file.",
      );
    if (file.size > fileLimit(mime))
      throw new RequestError(
        413,
        "Images may be up to 10 MB, PDFs 15 MB and videos 50 MB.",
      );
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "application/pdf": "pdf",
      "video/mp4": "mp4",
      "video/webm": "webm",
    };
    const id = crypto.randomUUID();
    const path = `${user.id}/${id}.${extensions[mime]}`;
    checked(
      await client.storage
        .from("company-media")
        .upload(path, bytes, { contentType: mime, upsert: false }),
    );
    const result = await client
      .from("cms_media")
      .insert({ id, name, path, mime, size: file.size, alt_text })
      .select()
      .single();
    if (result.error) {
      await client.storage.from("company-media").remove([path]);
      throw result.error;
    }
    return json({ media: result.data }, 201);
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request) {
  try {
    const { client } = await requireAdmin(request);
    const { id } = z.object({ id: z.uuid() }).parse(await jsonBody(request));
    const linked = checked(
      await client.from("cms_entries").select("id").eq("media_id", id).limit(1),
    );
    if (linked.length)
      throw new RequestError(
        409,
        "This file is attached to content. Remove that attachment before deleting the file.",
      );
    const media = checked(
      await client.from("cms_media").select("path").eq("id", id).single(),
    );
    checked(await client.storage.from("company-media").remove([media.path]));
    checked(await client.from("cms_media").delete().eq("id", id));
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
