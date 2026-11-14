import { ArrowUpRight } from "lucide-react";
import { PublicShell } from "../../components/public-shell";
import { publicData } from "../../lib/public-data";
import { publicDiscoveryEntries } from "../../lib/public-discovery";
import { discoverableEntries, publicPages } from "../../lib/discovery";
import "./sitemap.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Site map",
  description: "Find company information, borrowing guides, news, forms, resources and careers at Samuel Finance Limited.",
  alternates: { canonical: "/site-map" },
};

export default async function SiteMap() {
  const [{ company }, entries] = await Promise.all([publicData(), publicDiscoveryEntries()]);
  const pages = discoverableEntries(entries);
  const groups = [
    { title: "News & updates", kind: "update", href: "/updates", empty: "New company updates will appear here when published." },
    { title: "Forms & resources", kind: "document", href: "/loans", empty: "Published documents will appear here when available." },
    { title: "Career opportunities", kind: "vacancy", href: "/careers", empty: "Visit Careers for the latest availability." },
  ];
  return <PublicShell company={company}><main id="main">
    <section className="page-intro"><span className="eyebrow">FIND YOUR WAY</span><h1>A clearer <em>way around.</em></h1><p>Explore our company, understand the next steps and find every published page in one place.</p></section>
    <section className="listing-section sitemap-directory" aria-label="Website directory">
      <div className="sitemap-main-pages"><h2>Explore the website</h2><div className="sitemap-page-grid">{publicPages.filter(page => page.path !== "/site-map").map(page => <a key={page.path} href={page.path}><h3>{page.title}<ArrowUpRight size={17} /></h3><p>{page.description}</p></a>)}</div></div>
      <div className="sitemap-published-groups">{groups.map(group => <section key={group.kind}><h2>{group.title}</h2>{pages.some(page => page.kind === group.kind) ? <ul>{pages.filter(page => page.kind === group.kind).map(page => <li key={page.path}><a href={page.path}>{page.title}<ArrowUpRight size={15} /></a></li>)}</ul> : <p>{group.empty}</p>}<a className="text-link" href={group.href}>Browse {group.title.toLowerCase()}<ArrowUpRight size={15} /></a></section>)}</div>
      <div className="sitemap-assistance"><div><h2>Still looking for something?</h2><p>Our team can help you find the right information.</p></div><a className="button forest" href="/#contact">Contact our team<ArrowUpRight size={16} /></a></div>
    </section>
  </main></PublicShell>;
}
