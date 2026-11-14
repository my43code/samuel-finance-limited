import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { publicData, publicEntry } from "../../../lib/public-data";
import { PublicShell } from "../../../components/public-shell";
import { EntryMedia, dateLabel } from "../../../components/content";
import ShareButton from "../../../components/share-button";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { id } = await params;
  const entry = await publicEntry(id, "update");
  if (!entry) return { title: "Update not found", robots: { index: false } };
  const image = entry.media?.mime?.startsWith("image/") ? `/api/media/${entry.media_id}` : "/assets/mountains.jpg";
  return { title: entry.title, description: entry.summary, alternates: { canonical: `/updates/${id}` }, openGraph: { title: entry.title, description: entry.summary, url: `/updates/${id}`, type: "article", publishedTime: entry.published_at, images: [image] }, twitter: { card: "summary_large_image", title: entry.title, description: entry.summary, images: [image] } };
}
export default async function Article({ params }) {
  const { id } = await params;
  const entry = await publicEntry(id, "update");
  if (!entry) notFound();
  const { company } = await publicData();
  return (
    <PublicShell company={company}>
      <main className="article-page" id="main">
        <a className="text-link" href="/updates">
          <ArrowLeft size={16} />
          All updates
        </a>
        <span className="eyebrow">
          COMPANY UPDATE · {dateLabel(entry.published_at)}
        </span>
        <h1>{entry.title}</h1>
        <p className="article-summary">{entry.summary}</p>
        <div className="article-meta"><span>Samuel Finance Limited · {dateLabel(entry.published_at)}</span><ShareButton title={entry.title} path={`/updates/${entry.id}`} description={entry.summary} label="Share update" /></div>
        <div className="article-media">
          <EntryMedia entry={entry} />
        </div>
        <div className="article-body">
          {entry.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="article-share-footer"><div><span className="eyebrow">KEEP THE CONVERSATION GOING</span><h2>Useful information travels further.</h2></div><ShareButton title={entry.title} path={`/updates/${entry.id}`} description={entry.summary} label="Share this update" /></div>
      </main>
    </PublicShell>
  );
}
