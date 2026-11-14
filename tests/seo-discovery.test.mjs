import test from "node:test";
import assert from "node:assert/strict";
import { discoverableEntries, sitemapRecords } from "../web/lib/discovery.js";

const entry = { id: "31415926-5358-4932-8462-643383279502", title: "Published update", kind: "update", status: "published", published_at: "2026-11-01T00:00:00Z", updated_at: "2026-11-12T00:00:00Z" };

test("search discovery includes public detail pages without exposing drafts, media or broken resources", () => {
  const rows = [entry, { ...entry }, { ...entry, status: "draft" }, { ...entry, status: "archived" }, { ...entry, kind: "media" }, { ...entry, kind: "document", media_id: null }, { ...entry, kind: "vacancy", id: "unsafe/path" }];
  assert.equal(discoverableEntries(rows).length, 1);
  const resource = discoverableEntries([{ ...entry, kind: "document", media_id: "published-file" }])[0];
  assert.equal(resource.path, "/loans/" + entry.id);
  const role = discoverableEntries([{ ...entry, kind: "vacancy" }])[0];
  assert.equal(role.path, "/careers/" + entry.id);
  assert.ok(sitemapRecords(rows).every(page => !page.url.includes("/admin") && !page.url.includes("/api/") && !page.url.includes("/auth/")));
});

test("sitemap uses real valid modification dates and omits fabricated timestamps for static pages", () => {
  const now = new Date("2026-11-15T00:00:00Z");
  assert.equal(discoverableEntries([entry], now)[0].lastModified, "2026-11-12T00:00:00.000Z");
  assert.equal(discoverableEntries([{ ...entry, updated_at: "2027-01-01", published_at: "invalid" }], now)[0].lastModified, undefined);
  const sitemap = sitemapRecords([entry], now);
  assert.equal(sitemap[0].url, "https://samuelfinancelimited.com/");
  assert.equal(sitemap[0].lastModified, undefined);
  assert.ok(sitemap.some(page => page.url.endsWith("/guides/borrowing-basics")));
  assert.ok(sitemap.some(page => page.url.endsWith("/guides/preparing-an-enquiry")));
});
