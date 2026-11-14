"use client";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, Film, X } from "lucide-react";
import { mediaUrl } from "../lib/defaults";

function isVideo(entry) { return entry.media?.mime?.startsWith("video/"); }

export default function StoryGallery({ entries = [] }) {
  const items = entries.filter(entry => entry.media_id && (isVideo(entry) || entry.media?.mime?.startsWith("image/"))).slice(0, 4);
  const dialog = useRef(null);
  const heading = useId();
  const [active, setActive] = useState(0), [visible, setVisible] = useState(false);
  if (!items.length) return null;
  const current = items[Math.min(active, items.length - 1)];
  function stopVideo() {
    dialog.current?.querySelectorAll("video").forEach(video => { video.pause(); try { video.currentTime = 0; } catch {} });
  }
  function open(index) { setActive(index); setVisible(true); dialog.current.showModal(); }
  function close() { stopVideo(); dialog.current.close(); }
  function move(step) { stopVideo(); setActive(index => (index + step + items.length) % items.length); }
  return <>
    <div className="story-gallery" data-count={items.length}>
      {items.map((entry, index) => <figure className="story-gallery-card" key={entry.id}>
        <button className="story-gallery-preview" type="button" aria-label={`View ${entry.title}`} onClick={() => open(index)}>
          {isVideo(entry) ? <video preload="metadata" muted playsInline src={mediaUrl(entry.media_id)} aria-hidden="true" /> : <img loading="lazy" src={mediaUrl(entry.media_id)} alt={entry.media?.alt_text || entry.title} />}
          <span className="story-gallery-type">{isVideo(entry) ? <><Film size={13} /> VIDEO</> : "IN PICTURES"}</span>
          <span className="story-gallery-expand" aria-hidden="true"><Expand size={17} /></span>
          <span className="story-gallery-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </button>
        <figcaption><strong>{entry.title}</strong>{entry.summary && <span>{entry.summary}</span>}</figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className="story-viewer" aria-labelledby={heading} onClose={() => { stopVideo(); setVisible(false); }} onClick={event => {
      if (event.target !== dialog.current) return;
      const bounds = dialog.current.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }} onKeyDown={event => {
      if (items.length < 2 || event.target.closest("video,input,textarea,select")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
    }}>
      <div className="story-viewer-top"><span className="eyebrow">OUR STORY, IN FOCUS</span><button autoFocus type="button" aria-label="Close media viewer" onClick={close}><X size={21} /></button></div>
      <div className="story-viewer-media" key={current.id}>{visible && (isVideo(current) ? <video controls playsInline preload="metadata" src={mediaUrl(current.media_id)} aria-label={current.media?.alt_text || current.title} /> : <img src={mediaUrl(current.media_id)} alt={current.media?.alt_text || current.title} />)}</div>
      <div className="story-viewer-footer"><div><h2 id={heading}>{current.title}</h2>{current.summary && <p>{current.summary}</p>}</div><div className="story-viewer-controls">
        {items.length > 1 && <button type="button" aria-label="Previous gallery item" onClick={() => move(-1)}><ArrowLeft size={18} /></button>}
        <span className="story-viewer-count" role="status" aria-live="polite">{active + 1} <span>of {items.length}</span></span>
        {items.length > 1 && <button type="button" aria-label="Next gallery item" onClick={() => move(1)}><ArrowRight size={18} /></button>}
      </div></div>
    </dialog>
  </>;
}
