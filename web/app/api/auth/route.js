import { sessionClient, configuration } from "../../../lib/supabase";
import {
  json,
  jsonBody,
  sameOrigin,
  failure,
  RequestError,
} from "../../../lib/http";
const attempts = new Map();
export async function POST(request) {
  try {
    sameOrigin(request);
    if (!configuration())
      throw new RequestError(
        503,
        "Administrator sign-in is being configured. Please contact the site owner.",
      );
    const client = await sessionClient();
    const input = await jsonBody(request);
    if (input.action === "logout") {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return json({ ok: true });
    }
    if (input.action === "password") {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user)
        throw new RequestError(
          401,
          "Your password reset link has expired. Request a new link.",
        );
      if (
        typeof input.password !== "string" ||
        input.password.length < 12 ||
        input.password.length > 128
      )
        throw new RequestError(400, "Use a password with 12–128 characters.");
      const { error } = await client.auth.updateUser({
        password: input.password,
      });
      if (error)
        throw new RequestError(
          400,
          "The password could not be updated. Use a stronger password or request a new link.",
        );
      await client.auth.signOut();
      return json({ ok: true });
    }
    if (!["login", "recover"].includes(input.action))
      throw new RequestError(400, "Unknown sign-in action.");
    if (
      typeof input.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
      input.email.length > 254
    )
      throw new RequestError(400, "Enter a valid email address.");
    const email = input.email.trim().toLowerCase();
    // Supabase also enforces project-wide authentication rate limits.
    const current = Date.now();
    for (const [key, value] of attempts)
      if (value.expires < current) attempts.delete(key);
    const attempt = attempts.get(email) || {
      count: 0,
      expires: current + 900000,
    };
    if (attempt.count >= 8)
      throw new RequestError(
        429,
        "Too many sign-in attempts. Please try again in 15 minutes.",
      );
    attempt.count++;
    attempts.set(email, attempt);
    if (attempts.size > 5000) attempts.delete(attempts.keys().next().value);
    if (input.action === "recover") {
      const base = process.env.SITE_URL || new URL(request.url).origin;
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${base.replace(/\/$/, "")}/auth/callback`,
      });
      if (error && error.status === 429)
        throw new RequestError(
          429,
          "Please wait before requesting another recovery email.",
        );
      if (error)
        throw new RequestError(
          503,
          "The recovery service is temporarily unavailable. Please try again shortly.",
        );
      return json({
        ok: true,
        message:
          "If this email belongs to an account, a recovery link will arrive shortly.",
      });
    }
    if (
      typeof input.password !== "string" ||
      !input.password ||
      input.password.length > 128
    )
      throw new RequestError(400, "Enter your password.");
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error || !data.user)
      throw new RequestError(401, "The email or password is incorrect.");
    const { data: admin } = await client
      .from("cms_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!admin) {
      await client.auth.signOut();
      throw new RequestError(
        403,
        "This account does not have administrator access. Contact the site owner.",
      );
    }
    attempts.delete(email);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
