import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { publicData, publicEntry } from "../../../lib/public-data";
import { PublicShell } from "../../../components/public-shell";
import { EntryMedia, dateLabel } from "../../../components/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { id } = await params;
  const entry = await publicEntry(id, "update");
  return { title: entry?.title || "Update not found" };
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
        <div className="article-media">
          <EntryMedia entry={entry} />
        </div>
        <div className="article-body">
          {entry.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>
    </PublicShell>
  );
}
