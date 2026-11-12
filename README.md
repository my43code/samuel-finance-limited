# Samuel Finance Limited

A corporate website and administrator content workspace built with Next.js,
Supabase Auth, Postgres and private Supabase Storage, packaged for Hostinger
Node.js hosting.

Administrators manage company information, news, photos, short videos, PDF loan
application forms and job vacancies. Content supports drafts, publication,
archiving, revision checks and a database-generated activity log.

The public website includes company information, news articles, a media gallery,
downloadable forms, careers and contact details. No loan approval, regulatory
status or product availability is implied by the website.

## Setup

See [HOSTINGER.md](HOSTINGER.md) for Supabase provisioning, the first
administrator, environment variables and deployment settings.

    npm ci
    npm run dev
    npm test
    npm run build
    npm start

Use Node.js 22.13 or newer. Put local Supabase configuration in an ignored
.env.local using the names in .env.example. Never commit passwords, access
tokens or service-role keys.

## Source

- **web/app:** public pages, administrator pages and protected API routes.
- **web/components:** public site, sign-in and content workspace interfaces.
- **web/lib:** Supabase clients, validation and published-content queries.
- **supabase/migrations:** CMS schema, row-level policies and private storage.
- **scripts/build-hostinger.mjs:** standalone build and packaging.
- **tests:** validation, Postgres authorization and browser workflows.
- **public/assets:** supplied company imagery and the existing mountain photo.

The older app, lib, worker and D1 files remain for the separate legacy
Cloudflare build through **npm run build:sites**. The current Hostinger site
and dashboard use the Supabase implementation under **web**.

## Validation

**npm test** checks real Postgres RLS policies through an isolated PGlite
database: anonymous and non-admin access, private drafts/files, membership
escalation, publication, revisions and activity.

After **npm run build**, **npm run test:browser** checks the compiled server
using Edge and a local Supabase protocol fixture. It exercises sign-in,
draft/public visibility, publication, file uploads/downloads, vacancies,
company profile updates, sign-out and mobile layouts. It does not alter a live
Supabase project. See the deployment guide for production verification.
