import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, FileText, ShieldCheck } from "lucide-react";
import { publicData, publicEntry } from "../../../lib/public-data";
import { mediaUrl } from "../../../lib/defaults";
import { PublicShell } from "../../../components/public-shell";
import { dateLabel } from "../../../components/content";
import ShareButton from "../../../components/share-button";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { id } = await params, entry = await publicEntry(id, "document");
  if (!entry?.media_id) return { title: "Resource not found", robots: { index: false } };
  return { title: entry.title, description: entry.summary || "Published resource from Samuel Finance Limited.", alternates: { canonical: `/loans/${id}` }, openGraph: { title: entry.title, description: entry.summary || "A resource from Samuel Finance Limited.", url: `/loans/${id}`, type: "website", images: ["/assets/mountains.jpg"] }, twitter: { card: "summary_large_image", title: entry.title, description: entry.summary || "Published resource from Samuel Finance Limited.", images: ["/assets/mountains.jpg"] } };
}
export default async function Resource({ params }) {
  const { id } = await params, entry = await publicEntry(id, "document");
  if (!entry?.media_id) notFound();
  const { company } = await publicData();
  return <PublicShell company={company}><main className="resource-page" id="main"><a className="text-link" href="/loans"><ArrowLeft size={15} /> All forms & resources</a><div className="resource-layout"><article><span className="eyebrow">FORMS & RESOURCES · PDF DOCUMENT</span><h1>{entry.title}</h1>{entry.summary && <p className="article-summary">{entry.summary}</p>}<div className="article-meta"><span>Published {dateLabel(entry.published_at)}</span><ShareButton title={entry.title} path={`/loans/${id}`} description={entry.summary} label="Share resource" /></div><div className="article-body">{entry.body ? entry.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>) : <p>Download the published document and contact our team if you need help understanding the next steps.</p>}</div></article><aside className="resource-download-panel"><span className="resource-file-mark"><FileText size={39} /></span><span className="eyebrow">PUBLISHED RESOURCE</span><h2>Your next step, informed.</h2><p>Keep a copy of this document and read its instructions carefully.</p><a className="button forest" href={`${mediaUrl(entry.media_id)}?download=1`}>Download PDF <Download size={17} /></a><a className="text-link" href={mediaUrl(entry.media_id)} target="_blank" rel="noopener noreferrer">Open document <ArrowUpRight size={15} /></a><span className="resource-assurance"><ShieldCheck size={17} /> Confirm a secure submission method with our team before sharing personal information.</span></aside></div><div className="article-contact"><span className="eyebrow">WE’RE HERE TO HELP</span><h2>A question about this resource?</h2><p>Ask our team which document and process are right for your enquiry.</p><a className="button forest" href={`mailto:${company.email}`}>Contact our team <ArrowUpRight size={16} /></a></div></main></PublicShell>;
}
