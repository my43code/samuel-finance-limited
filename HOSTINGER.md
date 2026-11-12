# Hostinger deployment

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
