"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ArrowRight, LayoutGrid, List } from "lucide-react";
import { UpdateCard, DocumentCard } from "./content";

export default function PublicListing({ entries, kind }) {
  const [query, setQuery] = useState(""), [sort, setSort] = useState("newest"), [view, setView] = useState("grid");
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const documents = kind === "document";
  const results = useMemo(() => entries.filter(e => `${e.title} ${e.summary} ${e.body}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? new Date(a.published_at) - new Date(b.published_at) : new Date(b.published_at) - new Date(a.published_at)), [entries, query, sort]);
  return <div className="public-listing"><div className="content-toolbar"><div className="public-search"><Search size={18} /><input disabled={!ready} type="search" aria-label={documents ? "Search forms and resources" : "Search news and updates"} placeholder={documents ? "Find a form or resource…" : "Search news and updates…"} value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={16} /></button>}</div><div className="listing-toolbar-actions"><label className="public-sort"><SlidersHorizontal size={16} /><span>Sort by</span><select disabled={!ready} aria-label="Sort results" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">A–Z</option></select></label><div className="listing-view-controls" role="group" aria-label="Display results"><button type="button" disabled={!ready} aria-label="Card view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><LayoutGrid size={15} aria-hidden="true" /><span>Cards</span></button><button type="button" disabled={!ready} aria-label="Compact view" aria-pressed={view === "compact"} onClick={() => setView("compact")}><List size={16} aria-hidden="true" /><span>Compact</span></button></div></div></div>
    <div className="listing-count" role="status" aria-live="polite"><span>{results.length} {documents ? (results.length === 1 ? "resource" : "resources") : (results.length === 1 ? "update" : "updates")}{query.trim() ? ` matching “${query.trim()}”` : " available"}</span><span>{documents ? "Published documents · Direct downloads" : "Company news · Announcements · Perspectives"}</span></div>
    {results.length ? <div className={`${documents ? "documents-list" : "updates-grid"} listing-view-${view}`}>{results.map(entry => documents ? <DocumentCard key={entry.id} entry={entry} /> : <UpdateCard key={entry.id} entry={entry} />)}</div> : <div className="search-empty"><Search size={29} /><h3>No results for this search.</h3><p>Try another word or browse all {documents ? "resources" : "updates"}.</p><button className="text-link" onClick={() => setQuery("")}>Clear search <ArrowRight size={15} /></button></div>}
  </div>;
}
