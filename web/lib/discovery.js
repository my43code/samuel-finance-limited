export const siteOrigin = "https://samuelfinancelimited.com";

export const publicPages = [
  { path: "/", title: "Home", description: "Our company, approach, leadership and contact details." },
  { path: "/updates", title: "News & updates", description: "Published company news, announcements and perspectives." },
  { path: "/loans", title: "Forms & resources", description: "Application documents and instructions from our team." },
  { path: "/guides/borrowing-basics", title: "Borrowing basics", description: "Understand loan terms and questions to ask before borrowing." },
  { path: "/guides/preparing-an-enquiry", title: "Preparing an enquiry", description: "Plan your questions and prepare for a conversation with our team." },
  { path: "/careers", title: "Careers", description: "Current opportunities to join Samuel Finance Limited." },
  { path: "/privacy", title: "Privacy", description: "How public browsing, contact links and website information are handled." },
  { path: "/site-map", title: "Site map", description: "Browse the website and its published pages." },
];

export function discoverableEntries(entries, now = new Date()) {
  const routes = { update: "/updates/", document: "/loans/", vacancy: "/careers/" };
  const seen = new Set();
  return entries.flatMap((entry) => {
    if (entry.status !== "published" || !routes[entry.kind] || !/^[a-f0-9-]{36}$/i.test(entry.id || "")) return [];
    if (entry.kind === "document" && !entry.media_id) return [];
    const path = routes[entry.kind] + entry.id;
    if (seen.has(path)) return [];
    seen.add(path);
    const updated = [entry.updated_at, entry.published_at]
      .filter(Boolean)
      .map(value => new Date(value))
      .filter(date => Number.isFinite(date.getTime()) && date <= now)
      .sort((a, b) => b - a)[0];
    return [{ path, title: entry.title, kind: entry.kind, ...(updated ? { lastModified: updated.toISOString() } : {}) }];
  });
}

export function sitemapRecords(entries, now = new Date()) {
  return [
    ...publicPages.map(page => ({ url: siteOrigin + page.path })),
    ...discoverableEntries(entries, now).map(({ path, lastModified }) => ({
      url: siteOrigin + path,
      ...(lastModified ? { lastModified } : {}),
    })),
  ];
}
