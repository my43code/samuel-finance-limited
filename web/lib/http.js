import { administrator } from "./supabase";
export class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const expected = process.env.SITE_URL
    ? new URL(process.env.SITE_URL).origin
    : new URL(request.url).origin;
  if (!origin || origin !== expected)
    throw new RequestError(403, "Please submit this request from the website.");
}
export async function requireAdmin(request) {
  if (request.method !== "GET") sameOrigin(request);
  const admin = await administrator();
  if (!admin)
    throw new RequestError(
      401,
      "Your session has expired or this account does not have administrator access. Sign in again.",
    );
  return admin;
}
export async function jsonBody(request) {
  const body = await request.text();
  if (Buffer.byteLength(body) > 40000)
    throw new RequestError(413, "This content is too long.");
  try {
    return JSON.parse(body);
  } catch {
    throw new RequestError(400, "The request could not be read.");
  }
}
export const json = (value, status = 200) =>
  Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export function failure(error) {
  if (error.name === "ZodError")
    return json(
      { error: error.issues[0]?.message || "Check the highlighted fields." },
      400,
    );
  if (error instanceof RequestError)
    return json({ error: error.message }, error.status);
  console.error("CMS request failed:", error.code || error.name || "unknown");
  return json(
    {
      error:
        "The action could not be completed. Please try again. If this continues, check the Supabase connection and database setup.",
    },
    503,
  );
}
export function checked(result) {
  if (result.error) throw result.error;
  return result.data;
}
