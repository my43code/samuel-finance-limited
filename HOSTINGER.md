# Hostinger deployment

## GitHub Node.js deployment

The standard `npm run build` also runs `postbuild` to prepare `out/index.html`
and its public assets. This is the static output recognized by Hostinger's
Next.js deployment check. The Vinext/Worker output remains under `dist/`.
Redeploy the latest `main` commit in hPanel. If an output directory is requested,
use `out`. To build only the public static website, use `npm run build:hostinger`.

This output serves the company homepage; it does not include the Cloudflare
admin/API backend.

## Shared/static hosting

For Hostinger shared/static hosting connected to GitHub, deploy the repository
into the domain's `public_html` directory. The root `index.html` serves the
company website using the tracked files in `public/`. No Node build is required
for this static homepage.

If deploying files manually, upload the contents of `dist/` (including its
`index.html`, CSS, JavaScript and assets) directly into `public_html`.

After pulling the latest GitHub commit in hPanel, verify that
`public_html/index.html` exists. Use 755 for directories and 644 for public
files. If the homepage still returns 403, confirm the domain's document root
and check Hostinger's error log and any existing `.htaccess` deny rules.

The `/admin` dashboard and `/api` routes use Cloudflare Workers and D1. They
require the server deployment; copying the repository into shared hosting
does not run that backend.

When updating the static homepage, keep the root `index.html` synchronized
with `public/company.html`, prefixing its local asset references with `public/`.
