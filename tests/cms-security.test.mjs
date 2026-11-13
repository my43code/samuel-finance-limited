import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  entrySchema,
  companySchema,
  detectedMime,
  fileLimit,
} from "../web/lib/validation.js";
import { companyDefaults } from "../web/lib/defaults.js";
import { validateConfiguration } from "../web/lib/config.js";

test("configuration refuses service-role keys that would bypass database policies", () => {
  assert.equal(validateConfiguration("", "key"), null);
  assert.equal(validateConfiguration("not-a-url", "key"), null);
  assert.equal(
    validateConfiguration(
      "https://project.supabase.co",
      "sb_secret_fixture_only",
    ),
    null,
  );
  const elevated =
    "fixture." +
    Buffer.from(JSON.stringify({ role: "service_role" })).toString(
      "base64url",
    ) +
    ".fixture";
  assert.equal(
    validateConfiguration("https://project.supabase.co", elevated),
    null,
  );
  assert.ok(
    validateConfiguration(
      "https://project.supabase.co",
      "sb_publishable_fixture_only",
    ),
  );
});

test("validation rejects unsafe files and incomplete published content", () => {
  const base = {
    kind: "document",
    title: "Loan form",
    summary: "",
    body: "",
    status: "published",
    media_id: null,
    location: "",
    employment_type: "",
    closing_date: "",
    apply_email: "",
  };
  assert.equal(entrySchema.safeParse(base).success, false);
  assert.equal(
    entrySchema.safeParse({ ...base, status: "draft" }).success,
    true,
  );
  assert.equal(
    entrySchema.safeParse({ ...base, kind: "vacancy" }).success,
    false,
  );
  assert.equal(
    entrySchema.safeParse({
      ...base,
      kind: "vacancy",
      body: "Role requirements",
      location: "Port Moresby",
      apply_email: "careers@example.com",
    }).success,
    true,
  );
  assert.equal(
    entrySchema.safeParse({ ...base, closing_date: "2027-02-30" }).success,
    false,
  );
  assert.equal(companySchema.safeParse(companyDefaults).success, true);
  assert.equal(companySchema.safeParse({ ...companyDefaults, facebook: "" }).success, true);
  for (const facebook of ["javascript:alert(1)", "https://facebook.com.evil.test/page", "https://example.test", "http://facebook.com/page", "https://user:pass@facebook.com/page"]) {
    assert.equal(companySchema.safeParse({ ...companyDefaults, facebook }).success, false);
  }
  assert.equal(
    companySchema.safeParse({
      ...companyDefaults,
      email: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(detectedMime(Buffer.from('<svg onload="alert(1)">')), null);
  assert.equal(detectedMime(Buffer.from("<html>not an image</html>")), null);
  assert.equal(detectedMime(Buffer.from("%PDF-1.7\n")), "application/pdf");
  assert.equal(
    detectedMime(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(fileLimit("video/mp4"), 52428800);
  assert.equal(
    detectedMime(
      Buffer.from([0, 0, 0, 24, ...Buffer.from("ftypheic"), 0, 0, 0, 0]),
    ),
    null,
  );
  assert.equal(
    detectedMime(
      Buffer.from([0, 0, 0, 24, ...Buffer.from("ftypisom"), 0, 0, 0, 0]),
    ),
    "video/mp4",
  );
  assert.equal(
    detectedMime(
      Buffer.concat([Buffer.from([26, 69, 223, 163]), Buffer.from("webm")]),
    ),
    "video/webm",
  );
});

test("Postgres RLS protects membership, drafts, files and activity", async () => {
  const db = new PGlite();
  const admin = "11111111-1111-4111-8111-111111111111";
  const stranger = "22222222-2222-4222-8222-222222222222";
  const media = "33333333-3333-4333-8333-333333333333";
  const draft = "44444444-4444-4444-8444-444444444444";
  try {
    await db.exec(
      "create role anon; create role authenticated; create schema auth; create schema storage;",
    );
    await db.exec(
      "create table auth.users (id uuid primary key, email text); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;",
    );
    await db.exec(
      "grant usage on schema public,auth,storage to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;",
    );
    await db.exec(
      "create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid default gen_random_uuid() primary key,bucket_id text,name text); alter table storage.objects enable row level security; grant select,insert,delete on storage.objects to anon,authenticated; create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;",
    );
    await db.query("insert into auth.users values ($1,$2),($3,$4)", [
      admin,
      "admin@example.test",
      stranger,
      "visitor@example.test",
    ]);
    await db.exec(
      (
        await Promise.all(
          [
            "../supabase/migrations/20261112000100_cms.sql",
            "../supabase/migrations/20261112000200_leadership.sql",
          ].map((path) => readFile(new URL(path, import.meta.url), "utf8")),
        )
      ).join("\n"),
    );
    await db.query(
      "insert into public.cms_admins(user_id,display_name,role) values ($1,$2,$3)",
      [admin, "Administrator", "owner"],
    );
    // Existing project-wide policies must not weaken this bucket's boundary.
    await db.exec(
      "grant update on storage.objects to anon,authenticated; create policy broad_legacy_storage_policy on storage.objects for all to anon,authenticated using(true) with check(true)",
    );
    async function role(name, uid = "") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
        uid,
      ]);
      await db.exec("set role " + name);
    }
    await role("anon");
    await assert.rejects(
      db.query(
        "insert into storage.objects(bucket_id,name) values ('company-media','anonymous/file.png')",
      ),
    );
    assert.deepEqual(
      (await db.query("select * from public.cms_company")).rows.map(
        (r) => r.id,
      ),
      ["published"],
    );
    assert.equal(
      (await db.query("select public.cms_is_admin() as allowed")).rows[0]
        .allowed,
      false,
    );
    await assert.rejects(
      db.query(
        "insert into public.cms_entries(kind,title) values ('update','Unauthorised')",
      ),
    );
    await role("authenticated", stranger);
    assert.equal(
      (await db.query("select * from public.cms_admins")).rows.length,
      0,
    );
    await assert.rejects(
      db.query(
        "insert into public.cms_admins(user_id,role) values ($1,'owner')",
        [stranger],
      ),
    );
    await assert.rejects(
      db.query(
        "insert into public.cms_entries(kind,title) values ('update','Unauthorised')",
      ),
    );
    await assert.rejects(
      db.query("select public.cms_save_company(1,'{}'::jsonb,true)"),
    );
    await role("authenticated", admin);
    assert.equal(
      (await db.query("select public.cms_is_admin() as allowed")).rows[0]
        .allowed,
      true,
    );
    assert.equal(
      (await db.query("select * from public.cms_admins")).rows.length,
      1,
    );
    await assert.rejects(
      db.query(
        "insert into public.cms_admins(user_id,role) values ($1,'owner')",
        [stranger],
      ),
    );
    await db.query(
      "insert into storage.objects(bucket_id,name) values ('company-media',$1)",
      [admin + "/photo.png"],
    );
    await db.query(
      "insert into public.cms_media(id,name,path,mime,size,alt_text) values ($1,$2,$3,$4,100,$5)",
      [media, "Team photo", admin + "/photo.png", "image/png", "Company team"],
    );
    await db.query(
      "insert into public.cms_entries(id,kind,title,media_id) values ($1,'media','Draft photograph',$2)",
      [draft, media],
    );
    await role("anon");
    assert.equal(
      (await db.query("select * from public.cms_entries")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.cms_media")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      0,
    );
    await assert.rejects(db.query("select * from public.cms_activity"));
    await role("authenticated", stranger);
    assert.equal(
      (await db.query("select * from public.cms_entries")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from public.cms_activity")).rows.length,
      0,
    );
    await role("authenticated", admin);
    assert.equal(
      (await db.query("select * from public.cms_media")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    await assert.rejects(
      db.query(
        "insert into public.cms_entries(kind,title,status,media_id) values ('document','Wrong PDF type','published',$1)",
        [media],
      ),
    );
    await db.query(
      "update public.cms_entries set status='published' where id=$1",
      [draft],
    );
    const published = (
      await db.query(
        "select revision,published_at from public.cms_entries where id=$1",
        [draft],
      )
    ).rows[0];
    assert.equal(published.revision, 2);
    assert.ok(published.published_at);
    await role("anon");
    assert.equal(
      (await db.query("select * from public.cms_entries")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.cms_media")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      1,
    );
    await role("authenticated", admin);
    assert.equal(
      (
        await db.query(
          "delete from storage.objects where name=$1 returning id",
          [admin + "/photo.png"],
        )
      ).rows.length,
      0,
    );
    await assert.rejects(
      db.query("delete from public.cms_media where id=$1", [media]),
    );
    await db.query("update public.cms_entries set status='draft' where id=$1", [
      draft,
    ]);
    await role("anon");
    assert.equal(
      (await db.query("select * from storage.objects")).rows.length,
      0,
    );
    await role("authenticated", admin);
    await db.query("select public.cms_save_company(1,$1::jsonb,true)", [
      JSON.stringify({ name: "Published company" }),
    ]);
    assert.equal(
      (
        await db.query(
          "select content from public.cms_company where id='published'",
        )
      ).rows[0].content.name,
      "Published company",
    );
    await assert.rejects(
      db.query("select public.cms_save_company(1,'{}'::jsonb,true)"),
      /revision_conflict/,
    );
    await db.query("select public.cms_save_company(2,$1::jsonb,false)", [
      JSON.stringify({ name: "Private company draft" }),
    ]);
    await role("anon");
    assert.equal(
      (
        await db.query(
          "select content from public.cms_company where id='published'",
        )
      ).rows[0].content.name,
      "Published company",
    );
    await role("authenticated", admin);
    assert.ok(
      (await db.query("select * from public.cms_activity")).rows.length >= 5,
    );
    await db.query("delete from public.cms_entries where id=$1", [draft]);
    assert.equal(
      (
        await db.query(
          "delete from storage.objects where name=$1 returning id",
          [admin + "/photo.png"],
        )
      ).rows.length,
      1,
    );
    await db.query("delete from public.cms_media where id=$1", [media]);
  } finally {
    await db.close();
  }
});
