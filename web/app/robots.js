import { siteOrigin } from "../lib/discovery";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/auth/"],
    },
    sitemap: siteOrigin + "/sitemap.xml",
    host: siteOrigin,
  };
}
