# Samuel Finance deployment

The public website and administrator workspace now run together as a Next.js
Node application on Hostinger. Supabase provides Auth, Postgres and private file
storage. The older Cloudflare/D1 application is retained separately.

## 1. Configure Supabase

Apply **supabase/migrations/20261112000100_cms.sql** once through a Supabase
migration connection or the project's SQL Editor. The migration is transactional
and creates:

- **cms_admins:** approved administrator membership.
- **cms_company:** private draft and public company profiles.
- **cms_entries:** updates, gallery posts, loan forms and vacancies.
- **cms_media:** metadata for private uploads.
- **cms_activity:** a database-generated change log.

The **company-media** bucket is private. Row-level security is enabled on every
CMS table. Anonymous visitors can read only published content and files attached
to published content. Administrators cannot grant themselves new roles.

### First administrator

In Supabase **Authentication → Users**, create a confirmed user with your chosen
administrator email and a unique password of at least 12 characters. Set the
password inside Supabase; never put passwords in source control or chat.

Then run the following in SQL Editor, replacing the example email and display
name. Verify that exactly one row is returned.

    insert into public.cms_admins(user_id, display_name, role)
    select id, 'Website administrator', 'owner'
    from auth.users
    where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')
    on conflict(user_id) do update
    set display_name = excluded.display_name, role = excluded.role
    returning user_id, display_name, role;

Create additional users in Supabase and add them as **editor** through this
owner-controlled process. Disable public user signups in Supabase Auth settings.
There is no public registration or administrator-granting API.

### Password recovery

Set the Supabase Auth **Site URL** to https://samuelfinancelimited.com.
Add https://samuelfinancelimited.com/auth/callback as an allowed redirect URL.
For development, allow http://127.0.0.1:3000/auth/callback or
http://localhost:3000/auth/callback according to the development URL used.

Configure production SMTP in Supabase Auth for reliable password recovery.
Open recovery links in the same browser where recovery was requested: the
secure flow uses a browser-specific verification cookie.

## 2. Configure Hostinger

Use a **Node.js application**, not a PHP/static Git deployment.
Connect the GitHub repository's **main** branch and use:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Node.js | 22.13 or newer |
| Root | Repository root |
| Install | npm ci |
| Build | npm run build |
| Start | npm start |
| Output | Next.js default; .next/standalone if a custom field is mandatory |
| Entry file, if requested | .next/standalone/server.js |

Clear any previous **out** output override. The build produces a genuine Next.js
standalone server and includes its public assets and static files. Automatic
static export has been removed so administrator routes are not lost.

Add these **runtime environment variables** in Hostinger:

    SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
    SITE_URL=https://samuelfinancelimited.com

Use the project's publishable/anon key, never a service-role or secret key.
Database authorization relies on each user's token and RLS; no service-role key
is needed. Configuration is read at runtime.

Assign the domain to this Node.js application. A static public_html/index.html
cannot serve the CMS or API. Administrator routes on **www** redirect to the
canonical SITE_URL domain to keep session and recovery cookies on one host.

## 3. Verify after deployment

1. Open the homepage and check company information, navigation and images.
2. Sign in at **/admin/login** using the approved administrator account.
3. Save an update as a draft and confirm that visitors cannot read it.
4. Publish it and open its link while signed out.
5. Upload an image, a short video and a PDF in the media library.
6. Publish a gallery post and a loan form referencing those files.
7. Verify that the PDF downloads from **/loans**.
8. Publish a vacancy with a location, description, application email and closing
   date. Check **/careers**; expired vacancies leave the open-vacancy list.
9. Change and publish the company profile; check the homepage.
10. Sign out and verify that **/admin** returns to the login page.

If Supabase is not configured, public company defaults remain available but
sign-in is disabled with a setup message. Missing database tables or
administrator membership cannot grant dashboard access.

## Content workflow

- **Company profile:** save a private draft, review, then publish.
- **Updates:** draft, publish, edit, archive or delete.
- **Media:** upload privately, then attach to published content to share.
- **Loan forms:** attach a PDF, add instructions and publish.
- **Vacancies:** add requirements and an application email, then publish.
- **Activity:** database triggers record changes.

Images: up to 10 MB. PDFs: up to 15 MB. Videos: up to 50 MB.
Supported formats are JPEG, PNG, WebP, PDF, MP4 and WebM. Uploads are checked by
file contents. Use short, web-ready videos with useful descriptions/transcripts.
Hostinger must permit sufficiently large request bodies; the application proxy
allows 55 MB including multipart overhead.

Files in use cannot be deleted until their content attachments are removed.
Signed links expire after five minutes. An existing signed link can remain
usable until it expires after its content is unpublished.

Revision checks prevent silently overwriting another administrator's changes.
Public content is rendered as text, not arbitrary HTML. Completed loan
applications and sensitive customer documents are not collected by this site.

## Development and tests

Copy **.env.example** to an ignored **.env.local** and fill in the project values.
The development command reads that file.

    npm ci
    npm run dev
    npm test
    npm run build
    npm run test:browser

The database tests use real Postgres via PGlite with isolated test Auth/Storage
schemas. Browser tests use a local Supabase protocol fixture and the installed
Edge browser, never a real project. Set EDGE_PATH for another installed Chromium
browser. Screenshots are saved under ignored outputs/previews; dashboard
screenshots contain test data.

Verify real Supabase Auth, SMTP, hosted Storage and Hostinger once connected.

Legacy commands **dev:sites**, **build:sites**, **start:sites** retain the earlier
Cloudflare application. **build:hostinger** exports only the old static site;
use the normal build command for the current CMS.
