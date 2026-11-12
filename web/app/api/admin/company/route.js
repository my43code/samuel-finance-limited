import {
  requireAdmin,
  json,
  jsonBody,
  failure,
  checked,
} from "../../../../lib/http";
import { companySchema } from "../../../../lib/validation";
import { z } from "zod";
export async function POST(request) {
  try {
    const { client } = await requireAdmin(request);
    const input = z
      .object({
        revision: z.number().int().nonnegative(),
        publish: z.boolean(),
        content: companySchema,
      })
      .parse(await jsonBody(request));
    checked(
      await client.rpc("cms_save_company", {
        expected_revision: input.revision,
        content: input.content,
        publish_now: input.publish,
      }),
    );
    return json({ ok: true });
  } catch (error) {
    if (error.message?.includes("revision_conflict"))
      return json(
        {
          error: "Company information changed. Reload the page before editing.",
        },
        409,
      );
    return failure(error);
  }
}
