import {
  requireAdmin,
  json,
  jsonBody,
  failure,
  checked,
  RequestError,
} from "../../../../lib/http";
import { entrySchema } from "../../../../lib/validation";
import { z } from "zod";
export async function POST(request) {
  try {
    const { client } = await requireAdmin(request);
    const input = entrySchema.parse(await jsonBody(request));
    const { id, revision, ...values } = input;
    if (values.media_id) {
      const media = checked(
        await client
          .from("cms_media")
          .select("mime")
          .eq("id", values.media_id)
          .single(),
      );
      if (values.kind === "document" && media.mime !== "application/pdf")
        throw new RequestError(
          400,
          "Loan application forms must use a PDF file.",
        );
      if (
        ["media", "update"].includes(values.kind) &&
        !/^(image|video)\//.test(media.mime)
      )
        throw new RequestError(400, "Choose an image or video for this item.");
    }
    values.closing_date = values.closing_date || null;
    if (id) {
      const result = checked(
        await client
          .from("cms_entries")
          .update(values)
          .eq("id", id)
          .eq("revision", revision)
          .select()
          .maybeSingle(),
      );
      if (!result)
        throw new RequestError(
          409,
          "This item was changed by another administrator. Reload before editing.",
        );
      return json({ entry: result });
    }
    return json(
      {
        entry: checked(
          await client.from("cms_entries").insert(values).select().single(),
        ),
      },
      201,
    );
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request) {
  try {
    const { client } = await requireAdmin(request);
    const input = z
      .object({ id: z.uuid(), revision: z.number().int() })
      .parse(await jsonBody(request));
    const result = checked(
      await client
        .from("cms_entries")
        .delete()
        .eq("id", input.id)
        .eq("revision", input.revision)
        .select("id")
        .maybeSingle(),
    );
    if (!result)
      throw new RequestError(
        409,
        "This item changed or was already removed. Refresh the list.",
      );
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
