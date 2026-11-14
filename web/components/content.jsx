import {
  ArrowUpRight,
  Download,
  FileText,
  MapPin,
  CalendarDays,
  Play,
} from "lucide-react";
import { mediaUrl } from "../lib/defaults";
import ShareButton from "./share-button";
export function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Pacific/Port_Moresby",
      })
    : "";
}
export function EntryMedia({ entry, controls = true }) {
  if (!entry.media_id) return null;
  if (entry.media?.mime?.startsWith("video/"))
    return (
      <video
        controls={controls}
        preload="metadata"
        playsInline
        src={mediaUrl(entry.media_id)}
        aria-label={entry.media.alt_text || entry.title}
      />
    );
  if (entry.media?.mime?.startsWith("image/"))
    return (
      <img
        loading="lazy"
        src={mediaUrl(entry.media_id)}
        alt={entry.media.alt_text || entry.title}
      />
    );
  return null;
}
export function UpdateCard({ entry }) {
  return (
    <article className="update-card">
      <a href={`/updates/${entry.id}`} className="update-image">
        {entry.media_id && entry.media?.mime?.startsWith("image/") ? (
          <EntryMedia entry={entry} />
        ) : (
          <div className="update-placeholder">
            <span>
              SAMUEL
              <br />
              FINANCE
            </span>
            <span>Insights & perspectives</span>
          </div>
        )}
      </a>
      <div className="update-info">
        <span className="eyebrow">
          COMPANY UPDATE <span>·</span> {dateLabel(entry.published_at)}
        </span>
        <h3>
          <a href={`/updates/${entry.id}`}>{entry.title}</a>
        </h3>
        <p>{entry.summary}</p>
        <div className="content-card-actions"><a className="text-link" href={`/updates/${entry.id}`}>
          Read the update <ArrowUpRight size={16} />
        </a><ShareButton title={entry.title} path={`/updates/${entry.id}`} description={entry.summary} /></div>
      </div>
    </article>
  );
}
export function JobCard({ entry }) {
  const closed =
    entry.closing_date &&
    entry.closing_date < new Date().toISOString().slice(0, 10);
  return (
    <article className="job-card">
      <div>
        <span className="eyebrow">
          {entry.employment_type || "OPPORTUNITY"}
        </span>
        <h3>
          <a href={`/careers/${entry.id}`}>{entry.title}</a>
        </h3>
        <div className="job-meta">
          <span>
            <MapPin size={14} />
            {entry.location}
          </span>
          {entry.closing_date && (
            <span>
              <CalendarDays size={14} />
              {closed
                ? "Applications closed"
                : `Closes ${dateLabel(entry.closing_date)}`}
            </span>
          )}
        </div>
      </div>
      <a
        href={`/careers/${entry.id}`}
        className="round-link"
        aria-label={`View ${entry.title}`}
      >
        <ArrowUpRight size={22} />
      </a>
    </article>
  );
}
export function DocumentCard({ entry }) {
  return (
    <article className="document-card" id={`resource-${entry.id}`}>
      <span className="document-icon">
        <FileText size={27} />
      </span>
      <div>
        <span className="eyebrow">PDF RESOURCE · {dateLabel(entry.published_at)}</span>
        <h3><a href={`/loans/${entry.id}`}>{entry.title}</a></h3>
        {entry.summary && <p>{entry.summary}</p>}
        <a className="resource-detail-link" href={`/loans/${entry.id}`}>View details & instructions <ArrowUpRight size={13} /></a>
      </div>
      <div className="document-actions">
      <a
        className="button outline"
        href={`${mediaUrl(entry.media_id)}?download=1`}
      >
        Download form <Download size={15} />
      </a>
      <ShareButton title={entry.title} path={`/loans/${entry.id}`} description={entry.summary} label="Share resource" />
      </div>
    </article>
  );
}
export function PublicEmpty({ title, children }) {
  return (
    <div className="public-empty">
      <span className="empty-line" />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
