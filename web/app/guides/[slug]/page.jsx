import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";
import { PublicShell } from "../../../components/public-shell";
import ShareButton from "../../../components/share-button";
import { publicData } from "../../../lib/public-data";
import { guides, guideBySlug } from "../../../lib/guides";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Guide not found", robots: { index: false } };
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: guide.title,
      description: guide.summary,
      url: `/guides/${slug}`,
      type: "article",
      images: ["/assets/mountains.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.summary,
      images: ["/assets/mountains.jpg"],
    },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();
  const { company } = await publicData();
  const related = guides.find((item) => item.slug !== slug);
  return (
    <PublicShell company={company}>
      <main id="main" className="guide-page">
        <nav className="guide-breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden="true">/</span>
          <a href="/loans">Forms & resources</a><span aria-hidden="true">/</span>
          <span aria-current="page">{guide.eyebrow.toLowerCase()}</span>
        </nav>
        <div className="guide-layout">
          <article className="guide-content">
            <span className="eyebrow">{guide.eyebrow}</span>
            <h1>{guide.title}</h1>
            <p className="guide-summary">{guide.summary}</p>
            <div className="article-meta">
              <span><BookOpen size={15} /> {guide.readTime}</span>
              <ShareButton title={guide.title} path={`/guides/${slug}`} description={guide.summary} label="Share guide" />
            </div>
            {guide.sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              </section>
            ))}
            <div className="guide-note"><ShieldCheck size={20} /><p>General educational information, not personal financial advice. Confirm Samuel Finance product availability, eligibility and all terms directly with our team before making a decision.</p></div>
          </article>
          <aside className="guide-aside">
            <span className="eyebrow">IN THIS GUIDE</span>
            <nav aria-label="On this page">
              {guide.sections.map((section, index) => <a key={section.heading} href={`#section-${index + 1}`}>{String(index + 1).padStart(2, "0")} / {section.heading}</a>)}
            </nav>
            <h2>A clearer next step.</h2>
            <p>Find published forms or ask our team about the process that applies to your enquiry.</p>
            <a className="button forest" href="/loans">Forms & resources <ArrowUpRight size={16} /></a>
            <a className="text-link" href="/#contact">Speak with our team <ArrowUpRight size={15} /></a>
            {related && <a className="guide-related" href={`/guides/${related.slug}`}><span className="eyebrow">READ NEXT</span><strong>{related.title}</strong><ArrowRight size={18} /></a>}
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}
