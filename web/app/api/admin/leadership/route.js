import {
  requireAdmin,
  json,
  jsonBody,
  failure,
  checked,
  RequestError,
} from "../../../../lib/http";
import { leadershipSchema } from "../../../../lib/validation";
import { z } from "zod";

const select = "*,media:cms_media(id,mime,alt_text)";

export async function POST(request) {
  try {
    const { client } = await requireAdmin(request);
    const input = leadershipSchema.parse(await jsonBody(request));
    const { id, revision, ...values } = input;
    values.media_id = values.media_id || null;
    if (values.media_id) {
      const media = checked(
        await client
          .from("cms_media")
          .select("mime")
          .eq("id", values.media_id)
          .single(),
      );
      if (!media.mime.startsWith("image/"))
        throw new RequestError(
          400,
          "Choose an image for a leadership profile.",
        );
    }
    if (id) {
      const result = checked(
        await client
          .from("cms_leadership")
          .update(values)
          .eq("id", id)
          .eq("revision", revision)
          .select(select)
          .maybeSingle(),
      );
      if (!result)
        throw new RequestError(
          409,
          "This profile was changed by another administrator. Reload before editing.",
        );
      return json({ leader: result });
    }
    return json(
      {
        leader: checked(
          await client
            .from("cms_leadership")
            .insert(values)
            .select(select)
            .single(),
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
        .from("cms_leadership")
        .delete()
        .eq("id", input.id)
        .eq("revision", input.revision)
        .select("id")
        .maybeSingle(),
    );
    if (!result)
      throw new RequestError(
        409,
        "This profile changed or was already removed. Refresh the list.",
      );
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
