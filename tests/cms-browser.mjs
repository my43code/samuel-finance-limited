// Integration tests use a local Supabase protocol fixture, never a live project.
// Postgres RLS is exercised separately in cms-security.test.mjs.
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { companyDefaults } from "../web/lib/defaults.js";
const output = new URL("../outputs/previews/", import.meta.url);
await mkdir(output, { recursive: true });
const adminId = "11111111-1111-4111-8111-111111111111";
const visitorId = "22222222-2222-4222-8222-222222222222";
const state = {
  entries: [],
  media: [],
  leadership: [],
  activity: [],
  company: ["draft", "published"].map((id) => ({
    id,
    content: { ...companyDefaults },
    revision: 1,
    updated_at: new Date().toISOString(),
  })),
};
const files = new Map();
let mockUrl;
const makeUser = (id) => ({
  id,
  email: id === adminId ? "admin@example.test" : "visitor@example.test",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  created_at: new Date().toISOString(),
});
function session(id) {
  const token =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(
      JSON.stringify({
        sub: id,
        role: "authenticated",
        aud: "authenticated",
        iss: mockUrl + "/auth/v1",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url") +
    ".fixture-signature";
  return {
    access_token: token,
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: makeUser(id),
  };
}
function userId(req) {
  try {
    return JSON.parse(
      Buffer.from(
        (req.headers.authorization || "").split(".")[1],
        "base64url",
      ).toString(),
    ).sub;
  } catch {
    return null;
  }
}
function matches(row, url) {
  return [...url.searchParams].every(
    ([k, v]) => !v.startsWith("eq.") || String(row[k]) === v.slice(3),
  );
}
function decorated(rows, url) {
  return rows
    .filter((r) => matches(r, url))
    .map((r) =>
      url.searchParams.get("select")?.includes("media:")
        ? { ...r, media: state.media.find((m) => m.id === r.media_id) || null }
        : r,
    );
}
const mock = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  let body;
  try {
    body = JSON.parse(raw.toString());
  } catch {
    body = {};
  }
  const admin = userId(req) === adminId;
  const send = (value, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(value));
  };
  if (url.pathname === "/auth/v1/token") {
    if (body.password !== "Fixture-password-only!2026")
      return send(
        { error: "invalid_grant", error_description: "Invalid credentials" },
        400,
      );
    return send(
      session(body.email === "admin@example.test" ? adminId : visitorId),
    );
  }
  if (url.pathname === "/auth/v1/user")
    return userId(req)
      ? send(makeUser(userId(req)))
      : send({ msg: "Not authenticated" }, 401);
  if (url.pathname === "/auth/v1/logout") {
    res.writeHead(204);
    return res.end();
  }
  if (url.pathname === "/auth/v1/recover") return send({});
  if (url.pathname === "/rest/v1/rpc/cms_save_company") {
    if (!admin) return send({ message: "Forbidden" }, 403);
    const draft = state.company.find((c) => c.id === "draft");
    if (draft.revision !== body.expected_revision)
      return send({ message: "revision_conflict" }, 400);
    draft.content = body.content;
    draft.revision++;
    draft.updated_at = new Date().toISOString();
    if (body.publish_now)
      Object.assign(
        state.company.find((c) => c.id === "published"),
        { content: body.content, updated_at: draft.updated_at },
      );
    return send(null);
  }
  if (url.pathname.startsWith("/rest/v1/")) {
    const table = url.pathname.split("/").pop();
    const rows =
      table === "cms_admins"
        ? admin
          ? [
              {
                user_id: adminId,
                display_name: "Samuel Finance Admin",
                role: "owner",
              },
            ]
          : []
        : state[table.replace("cms_", "")];
    if (!rows) return send({ message: "Unknown fixture table " + table }, 404);
    if (req.method === "GET") {
      let allowed = rows;
      if (!admin && table === "cms_entries")
        allowed = rows.filter((r) => r.status === "published");
      if (!admin && table === "cms_media")
        allowed = rows.filter(
          (r) =>
            state.entries.some(
              (e) => e.media_id === r.id && e.status === "published",
            ) ||
            state.leadership.some(
              (leader) =>
                leader.media_id === r.id && leader.status === "published",
            ),
        );
      if (!admin && table === "cms_leadership")
        allowed = rows.filter((r) => r.status === "published");
      if (!admin && table === "cms_company")
        allowed = rows.filter((r) => r.id === "published");
      if (!admin && table === "cms_activity") allowed = [];
      const values = decorated(allowed, url);
      return send(
        req.headers.accept?.includes("vnd.pgrst.object")
          ? values[0] || null
          : values,
      );
    }
    if (!admin) return send({ message: "Forbidden" }, 403);
    if (req.method === "POST") {
      const row = {
        ...body,
        id: body.id || crypto.randomUUID(),
        revision: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at:
          body.status === "published" ? new Date().toISOString() : null,
      };
      rows.unshift(row);
      state.activity.unshift({
        id: state.activity.length + 1,
        actor: adminId,
        action: "insert",
        target: table,
        title: row.title || row.name,
        created_at: row.created_at,
      });
      return send(
        req.headers.accept?.includes("vnd.pgrst.object") ? row : [row],
        201,
      );
    }
    if (req.method === "PATCH") {
      const row = rows.find((r) => matches(r, url));
      if (row)
        Object.assign(row, body, {
          revision: row.revision + 1,
          updated_at: new Date().toISOString(),
          published_at:
            body.status === "published" ? new Date().toISOString() : null,
        });
      return send(
        req.headers.accept?.includes("vnd.pgrst.object")
          ? row || null
          : row
            ? [row]
            : [],
      );
    }
    if (req.method === "DELETE") {
      const selected = rows.filter((r) => matches(r, url));
      for (const row of selected) rows.splice(rows.indexOf(row), 1);
      return send(
        req.headers.accept?.includes("vnd.pgrst.object")
          ? selected[0] || null
          : selected,
      );
    }
  }
  if (url.pathname.startsWith("/storage/v1/object/sign/company-media/")) {
    const path = decodeURIComponent(url.pathname.split("/company-media/")[1]);
    if (req.method === "POST")
      return send({
        signedURL: "/object/sign/company-media/" + path + "?token=fixture",
      });
    const file = files.get(path);
    if (!file) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "Content-Type": file.mime });
    return res.end(file.bytes);
  }
  if (url.pathname.startsWith("/storage/v1/object/company-media")) {
    if (!admin) return send({ message: "Forbidden" }, 403);
    if (req.method === "POST") {
      const path = decodeURIComponent(url.pathname.split("/company-media/")[1]);
      files.set(path, { bytes: raw, mime: req.headers["content-type"] });
      return send({ Key: "company-media/" + path, Id: crypto.randomUUID() });
    }
    if (req.method === "DELETE") {
      for (const p of body.prefixes || []) files.delete(p);
      return send([]);
    }
  }
  return send(
    {
      message: "Unexpected fixture request " + req.method + " " + url.pathname,
    },
    404,
  );
});
await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
mockUrl = "http://127.0.0.1:" + mock.address().port;
const base = "http://127.0.0.1:3199";
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  env: {
    ...process.env,
    PORT: "3199",
    HOSTNAME: "127.0.0.1",
    SUPABASE_URL: mockUrl,
    SUPABASE_ANON_KEY: "fixture-publishable-key",
    SITE_URL: base,
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
child.stdout.on("data", (d) => (logs += d));
child.stderr.on("data", (d) => (logs += d));
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, "Next.js server failed: " + logs);
  assert.equal((await fetch(base + "/api/admin/overview")).status, 401);
  assert.equal(
    (
      await fetch(base + "/api/admin/entries", {
        method: "POST",
        headers: {
          Origin: "https://untrusted.test",
          "Content-Type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  browser = await chromium.launch({
    executablePath:
      process.env.EDGE_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.screenshot({
    path: new URL("website-desktop.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page.goto(base + "/admin");
  await page.waitForURL("**/admin/login");
  await page.screenshot({
    path: new URL("admin-login-desktop.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page.locator("input[name=email]").fill("visitor@example.test");
  await page.locator("input[name=password]").fill("Fixture-password-only!2026");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "does not have administrator access" })
    .waitFor();
  await page.locator("input[name=email]").fill("admin@example.test");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await page.waitForURL(base + "/admin");
  await page
    .getByRole("heading", { name: "Your website, well managed." })
    .waitFor();
  await page
    .getByRole("button", { name: "Create an update", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Title", { exact: true })
    .fill("A considered way forward");
  await dialog
    .getByLabel("Short description")
    .fill("An update about our company and the next chapter of our work.");
  await dialog
    .getByLabel("Full update")
    .fill(
      "This is a test announcement.\n\nThis content is written only to the local test fixture.",
    );
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  assert.equal(state.entries[0].status, "draft");
  const guest = await browser.newContext();
  assert.equal(
    (
      await guest.request.get(base + "/updates/" + state.entries[0].id)
    ).status(),
    404,
  );
  await page
    .getByRole("button", { name: "Edit A considered way forward", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Publish", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(state.entries[0].status, "published");
  const article = await guest.request.get(
    base + "/updates/" + state.entries[0].id,
  );
  assert.equal(article.status(), 200);
  assert.match(await article.text(), /A considered way forward/);
  await page
    .getByRole("button", { name: "Media library", exact: true })
    .click();
  await page.getByRole("button", { name: "Upload files", exact: true }).click();
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles({
      name: "application.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\nFixture document only.\n%%EOF"),
    });
  await page
    .getByRole("dialog")
    .getByLabel("File title")
    .fill("Loan application resource");
  await page
    .getByRole("dialog")
    .getByLabel("Description / alternative text")
    .fill("A test PDF application form");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Upload to library" })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(state.media.length, 1);
  assert.equal(
    (
      await guest.request.get(base + "/api/media/" + state.media[0].id)
    ).status(),
    404,
  );
  await page.getByRole("button", { name: "Loan forms", exact: true }).click();
  await page
    .getByRole("button", { name: "Add loan form", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Title", { exact: true })
    .fill("Personal loan application");
  await page
    .getByRole("dialog")
    .getByLabel("Short description")
    .fill("Read the instructions before completing this form.");
  await page
    .getByRole("dialog")
    .getByLabel("PDF application form", { exact: false })
    .selectOption(state.media[0].id);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Publish", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.equal(
    (
      await guest.request.get(base + "/api/media/" + state.media[0].id)
    ).status(),
    200,
  );
  const linkedDelete = await context.request.delete(base + "/api/admin/media", {
    headers: { Origin: base },
    data: { id: state.media[0].id },
  });
  assert.equal(linkedDelete.status(), 409);
  const imageUpload = await context.request.post(base + "/api/admin/media", {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "company-logo.png",
        mimeType: "image/png",
        buffer: await readFile(
          new URL("../public/assets/logo.png", import.meta.url),
        ),
      },
      name: "Company image",
      alt_text: "Samuel Finance company emblem",
    },
  });
  assert.equal(imageUpload.status(), 201);
  assert.equal(
    (await imageUpload.json()).media.mime,
    "image/jpeg",
    "File format is checked from content, not the filename",
  );
  const videoBytes = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#163f34";
    ctx.fillRect(0, 0, 64, 64);
    const stream = canvas.captureStream(10),
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.start();
      setTimeout(() => recorder.stop(), 500);
    });
    stream.getTracks().forEach((t) => t.stop());
    return Array.from(
      new Uint8Array(
        await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
      ),
    );
  });
  const videoUpload = await context.request.post(base + "/api/admin/media", {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "company-video.webm",
        mimeType: "video/webm",
        buffer: Buffer.from(videoBytes),
      },
      name: "Company video",
      alt_text: "Company colour video fixture",
    },
  });
  assert.equal(videoUpload.status(), 201);
  const video = (await videoUpload.json()).media;
  const gallery = await context.request.post(base + "/api/admin/entries", {
    headers: { Origin: base },
    data: {
      kind: "media",
      title: "A moment from Samuel Finance",
      summary: "Test gallery caption.",
      body: "",
      status: "published",
      media_id: video.id,
      location: "",
      employment_type: "",
      closing_date: "",
      apply_email: "",
    },
  });
  assert.equal(gallery.status(), 201);
  const largeVideo = Buffer.alloc(11 * 1024 * 1024);
  Buffer.from(videoBytes).copy(largeVideo);
  const largeUpload = await context.request.post(base + "/api/admin/media", {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "large-video.webm",
        mimeType: "video/webm",
        buffer: largeVideo,
      },
      name: "Transport limit check",
      alt_text: "Temporary large video transport test",
    },
  });
  assert.equal(
    largeUpload.status(),
    201,
    "Video uploads can exceed the default 10 MB proxy limit",
  );
  const invalidUpload = await context.request.post(base + "/api/admin/media", {
    headers: { Origin: base },
    multipart: {
      file: {
        name: "fake.png",
        mimeType: "image/png",
        buffer: Buffer.from('<svg onload="alert(1)"/>'),
      },
      name: "Rejected file",
      alt_text: "This unsupported file must be rejected",
    },
  });
  assert.equal(invalidUpload.status(), 415);
  await page
    .getByRole("button", { name: "Job vacancies", exact: true })
    .click();
  await page.getByRole("button", { name: "New vacancy", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Job title")
    .fill("Accounts Officer");
  await page
    .getByRole("dialog")
    .getByLabel("Short description")
    .fill("A test vacancy for the local integration checks.");
  await page
    .getByRole("dialog")
    .getByLabel("Job description & application instructions")
    .fill("Support accurate company records and clear communication.");
  await page
    .getByRole("dialog")
    .getByLabel("Location", { exact: true })
    .fill("Port Moresby");
  await page
    .getByRole("dialog")
    .getByLabel("Employment type")
    .selectOption("Full-time");
  await page.getByRole("dialog").getByLabel("Closing date").fill("2027-12-31");
  await page
    .getByRole("dialog")
    .getByLabel("Application email")
    .fill("careers@example.test");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Publish", exact: true })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.match(
    await (await guest.request.get(base + "/careers")).text(),
    /Accounts Officer/,
  );
  await page
    .getByRole("button", { name: "Company profile", exact: true })
    .click();
  await page
    .getByLabel("Company headline")
    .fill("A carefully considered next chapter.");
  await page.getByRole("button", { name: "Review & publish" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Publish company profile" })
    .click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert.match(
    await (await guest.request.get(base)).text(),
    /A carefully considered next chapter/,
  );
  const stale = await context.request.post(base + "/api/admin/company", {
    headers: { Origin: base },
    data: { revision: 1, publish: true, content: companyDefaults },
  });
  assert.equal(stale.status(), 409);
  // Public sharing must target readable published pages, not private storage URLs.
  const sharedPage = await guest.newPage();
  sharedPage.on("pageerror", error => errors.push(error.message));
  await sharedPage.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async value => { if (window.rejectClipboard) throw new Error("Denied"); window.copiedLink = value; } } });
    Object.defineProperty(navigator, "share", { configurable: true, value: async data => { window.nativeShareData = data; } });
  });
  await sharedPage.goto(base + "/updates", { waitUntil: "domcontentloaded" });
  await sharedPage.getByRole("searchbox", { name: "Search news and updates" }).fill("no matching announcement");
  await sharedPage.getByRole("heading", { name: "No results for this search." }).waitFor();
  await sharedPage.getByRole("searchbox", { name: "Search news and updates" }).fill("");
  await sharedPage.getByRole("button", { name: "Share A considered way forward", exact: true }).click();
  const sharedUpdate = state.entries.find(e => e.title === "A considered way forward");
  const shareDialog = sharedPage.getByRole("dialog", { name: "Share this with someone." });
  await shareDialog.waitFor();
  assert.equal(await shareDialog.getByRole("link", { name: "Facebook" }).getAttribute("href"), "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(base + "/updates/" + sharedUpdate.id));
  assert.match(await shareDialog.getByRole("link", { name: "WhatsApp" }).getAttribute("href"), /^https:\/\/wa.me\/\?text=/);
  assert.match(await shareDialog.getByRole("link", { name: "LinkedIn" }).getAttribute("href"), /^https:\/\/www.linkedin.com\/sharing\/share-offsite\//);
  await shareDialog.getByRole("button", { name: "Copy link", exact: true }).click();
  assert.equal(await sharedPage.evaluate(() => window.copiedLink), base + "/updates/" + sharedUpdate.id);
  await shareDialog.getByRole("button", { name: "More sharing options on your device" }).click();
  assert.equal((await sharedPage.evaluate(() => window.nativeShareData)).url, base + "/updates/" + sharedUpdate.id);
  await sharedPage.keyboard.press("Escape");
  await shareDialog.waitFor({ state: "hidden" });
  await sharedPage.goto(base + "/loans", { waitUntil: "domcontentloaded" });
  await sharedPage.getByRole("searchbox", { name: "Search forms and resources" }).fill("Personal loan");
  const resource = state.entries.find(e => e.kind === "document");
  await sharedPage.getByRole("link", { name: "View details & instructions" }).click();
  await sharedPage.waitForURL(base + "/loans/" + resource.id);
  await sharedPage.getByRole("heading", { name: "Personal loan application", exact: true }).waitFor();
  assert.equal(await sharedPage.locator('meta[property="og:title"]').getAttribute("content"), "Personal loan application");
  assert.equal(await sharedPage.locator('link[rel="canonical"]').getAttribute("href"), "https://samuelfinancelimited.com/loans/" + resource.id);
  assert.match(await sharedPage.getByRole("link", { name: "Download PDF", exact: true }).getAttribute("href"), /\?download=1$/);
  await sharedPage.setViewportSize({ width: 390, height: 844 });
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Mobile resource detail overflows");
  await sharedPage.getByRole("button", { name: "Share Personal loan application" }).click();
  await shareDialog.waitFor();
  await sharedPage.evaluate(() => { window.rejectClipboard = true; });
  await shareDialog.getByRole("button", { name: "Copy link", exact: true }).click();
  await shareDialog.getByRole("status").filter({ hasText: "Copy the selected link" }).waitFor();
  assert.equal(await shareDialog.getByLabel("Direct link").inputValue(), base + "/loans/" + resource.id);
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Mobile sharing dialog overflows");
  await sharedPage.screenshot({ path: new URL("sharing-mobile.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: false });
  await sharedPage.keyboard.press("Escape");
  await sharedPage.goto(base + "/loans", { waitUntil: "domcontentloaded" });
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, "Mobile resource list overflows");
  // Exercise discovery and homepage movement with enough published fixture posts
  // to overflow a desktop row. These rows exist only in this in-memory fixture.
  for (let i = 0; i < 3; i++) state.entries.push({ ...sharedUpdate, id: `33333333-3333-4333-8333-33333333333${i}`, title: `Published fixture update ${i + 1}` });
  const privateUpdate = { ...sharedUpdate, id: "44444444-4444-4444-8444-444444444444", title: "Private fixture draft", status: "draft" };
  state.entries.push(privateUpdate);
  let sitemap = await guest.request.get(base + "/sitemap.xml");
  assert.equal(sitemap.status(), 200);
  assert.match(sitemap.headers()["content-type"], /xml/);
  let xml = await sitemap.text();
  assert.ok(xml.includes("/updates/" + sharedUpdate.id));
  assert.ok(xml.includes("/loans/" + resource.id));
  assert.ok(xml.includes("/guides/borrowing-basics"));
  assert.ok(!xml.includes(privateUpdate.id), "Sitemap exposed draft content");
  assert.ok(!xml.includes("/admin") && !xml.includes("/api/"));
  privateUpdate.status = "published";
  assert.ok((await (await guest.request.get(base + "/sitemap.xml")).text()).includes(privateUpdate.id), "Newly published content missing from dynamic sitemap");
  privateUpdate.status = "draft";
  const robots = await (await guest.request.get(base + "/robots.txt")).text();
  assert.match(robots, /Sitemap: https:\/\/samuelfinancelimited.com\/sitemap.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(await (await guest.request.get(base + "/admin/login")).text(), /name="robots" content="noindex, nofollow"/);
  await sharedPage.emulateMedia({ reducedMotion: "reduce" });
  await sharedPage.setViewportSize({ width: 1440, height: 1000 });
  await sharedPage.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await sharedPage.getByRole("dialog", { name: "Contact Samuel Finance" }).count(), 0, "Contact details should start collapsed");
  await sharedPage.getByRole("button", { name: "Open contact details" }).click();
  await sharedPage.getByRole("dialog", { name: "Contact Samuel Finance" }).waitFor();
  await sharedPage.keyboard.press("Escape");
  await sharedPage.getByRole("button", { name: "Open contact details" }).waitFor();
  const newsSlider = sharedPage.getByRole("region", { name: "Latest news and updates", exact: true });
  const resourceSlider = sharedPage.getByRole("region", { name: "Forms, resources and finance guides", exact: true });
  const heroSlider = sharedPage.locator(".home-hero").getByRole("region", { name: "Featured news and resources", exact: true });
  await heroSlider.getByRole("button", { name: "Play featured news and resources slideshow" }).waitFor();
  await heroSlider.getByRole("button", { name: "Next featured news and resources" }).click();
  await sharedPage.waitForFunction(() => document.getElementById("hero-highlights-track").scrollLeft > 50);
  const heroResource = heroSlider.locator(".hero-highlight-card").filter({ has: sharedPage.getByRole("link", { name: "Personal loan application", exact: true }) });
  assert.equal(await heroResource.getByRole("link", { name: "Open resource" }).getAttribute("href"), "/loans/" + resource.id);
  await heroResource.getByRole("button", { name: "Share Personal loan application" }).click();
  await shareDialog.waitFor();
  assert.equal(await shareDialog.getByLabel("Direct link").inputValue(), base + "/loans/" + resource.id);
  await sharedPage.keyboard.press("Escape");
  await heroSlider.getByRole("button", { name: "Previous featured news and resources" }).click();
  await sharedPage.waitForFunction(() => document.getElementById("hero-highlights-track").scrollLeft < 2);
  await heroSlider.getByRole("button", { name: "Play featured news and resources slideshow" }).click();
  await sharedPage.evaluate(() => document.activeElement.blur());
  await sharedPage.mouse.move(0, 0);
  await sharedPage.waitForFunction(() => document.getElementById("hero-highlights-track").scrollLeft > 50, null, { timeout: 10000 });
  await heroSlider.getByRole("button", { name: "Pause featured news and resources slideshow" }).click();
  await sharedPage.locator(".home-hero").screenshot({ path: new URL("hero-highlights-desktop.png", output).pathname.replace(/^\/([A-Z]:)/, "$1") });
  for (const width of [900, 390]) {
    await sharedPage.setViewportSize({ width, height: 1000 });
    assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Hero overflows at ${width}px`);
    await heroSlider.scrollIntoViewIfNeeded();
    const fits = await heroSlider.evaluate(node => { const panel = node.closest(".hero-highlights").getBoundingClientRect(), visual = node.closest(".hero-visual").getBoundingClientRect(); return panel.left >= visual.left && panel.right <= visual.right + 1 && panel.top >= visual.top && panel.bottom <= visual.bottom + 1; });
    assert.ok(fits, `Hero panel clipped at ${width}px`);
    await sharedPage.locator(".hero-visual").screenshot({ path: new URL(`hero-highlights-${width}.png`, output).pathname.replace(/^\/([A-Z]:)/, "$1") });
  }
  await sharedPage.setViewportSize({ width: 1440, height: 1000 });
  await newsSlider.getByRole("button", { name: "Play latest news and updates slideshow" }).waitFor();
  await newsSlider.getByRole("button", { name: "Next latest news and updates" }).click();
  await sharedPage.waitForFunction(() => document.getElementById("homepage-news-track").scrollLeft > 50);
  await newsSlider.locator(".home-carousel-track").focus();
  await sharedPage.keyboard.press("Home");
  await sharedPage.waitForFunction(() => document.getElementById("homepage-news-track").scrollLeft < 2);
  await newsSlider.getByRole("button", { name: "Play latest news and updates slideshow" }).click();
  await sharedPage.evaluate(() => document.activeElement.blur());
  await sharedPage.mouse.move(0, 0);
  await sharedPage.waitForFunction(() => document.getElementById("homepage-news-track").scrollLeft > 50, null, { timeout: 10000 });
  await newsSlider.getByRole("button", { name: "Pause latest news and updates slideshow" }).click();
  await resourceSlider.getByRole("button", { name: "Next forms, resources and finance guides" }).click();
  await sharedPage.waitForFunction(() => document.getElementById("homepage-resources-track").scrollLeft > 50);
  await resourceSlider.screenshot({ path: new URL("resource-slider-desktop.png", output).pathname.replace(/^\/([A-Z]:)/, "$1") });
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Desktop homepage overflows");
  const checklist = sharedPage.locator(".enquiry-checklist");
  for (const checkbox of await checklist.getByRole("checkbox").all()) await checkbox.check();
  await checklist.getByRole("status").filter({ hasText: "You have considered the key questions" }).waitFor();
  await checklist.getByRole("button", { name: "Reset" }).click();
  assert.equal(await checklist.locator("input:checked").count(), 0);
  await sharedPage.locator(".faq-list summary").first().click();
  assert.equal(await sharedPage.locator(".faq-list details").first().getAttribute("open"), "");
  await sharedPage.setViewportSize({ width: 390, height: 844 });
  await resourceSlider.scrollIntoViewIfNeeded();
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Mobile slider overflows");
  await resourceSlider.screenshot({ path: new URL("resource-slider-mobile.png", output).pathname.replace(/^\/([A-Z]:)/, "$1") });
  await sharedPage.goto(base + "/guides/borrowing-basics", { waitUntil: "domcontentloaded" });
  await sharedPage.getByRole("heading", { name: "Understand the cost of borrowing", exact: true }).waitFor();
  assert.equal(await sharedPage.locator('link[rel="canonical"]').getAttribute("href"), "https://samuelfinancelimited.com/guides/borrowing-basics");
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Mobile guide overflows");
  await sharedPage.screenshot({ path: new URL("borrowing-guide-mobile.png", output).pathname.replace(/^\/([A-Z]:)/, "$1"), fullPage: false });
  assert.equal((await guest.request.get(base + "/guides/not-a-guide")).status(), 404);
  await sharedPage.goto(base + "/site-map", { waitUntil: "domcontentloaded" });
  await sharedPage.getByRole("link", { name: "Borrowing basics", exact: true }).waitFor();
  assert.equal(await sharedPage.getByRole("link", { name: "Private fixture draft", exact: true }).count(), 0);
  assert.equal(await sharedPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Mobile sitemap overflows");
  await sharedPage.close();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({
    path: new URL("dashboard-desktop-fixture.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
    "Mobile dashboard overflows",
  );
  await page.screenshot({
    path: new URL("dashboard-mobile-fixture.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Account & security", exact: true })
    .click();
  await page.getByRole("button", { name: "Sign out of workspace" }).click();
  await page.waitForURL("**/admin/login");
  await page.screenshot({
    path: new URL("admin-login-mobile.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
    "Mobile homepage overflows",
  );
  await page.screenshot({
    path: new URL("website-mobile.png", output).pathname.replace(
      /^\/([A-Z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  assert.equal(
    (await context.request.get(base + "/api/admin/overview")).status(),
    401,
  );
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(
    "PASS: admin authorization, publishing, sharing, draft privacy, PDF downloads, dynamic sitemap/robots, homepage sliders and autoplay, preparation checklist, guides, mobile layouts and browser runtime checks.",
  );
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  if (browser) await browser.close();
  child.kill();
  await new Promise((resolve) => mock.close(resolve));
}
