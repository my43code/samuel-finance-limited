import { ArrowUpRight, FileText, Newspaper } from "lucide-react";
import HomeCarousel from "./home-carousel";
import ShareButton from "./share-button";
import { dateLabel } from "./content";

export default function HeroHighlights({ updates, resources }) {
  const news = updates.slice(0, 3).map(entry => ({
    id: entry.id, category: "NEWS & UPDATES", kind: "news", title: entry.title,
    summary: entry.summary, path: `/updates/${entry.id}`, date: entry.published_at,
    action: "Read update",
  }));
  const forms = resources.slice(0, 3).map(entry => ({
    id: entry.id, category: "FORMS & RESOURCES", kind: "resource", title: entry.title,
    summary: entry.summary || "Read the instructions and download this published resource.",
    path: `/loans/${entry.id}`, date: entry.published_at, action: "Open resource",
  }));
  if (!news.length) news.push({ id: "news-library", category: "NEWS & UPDATES", kind: "news", title: "Stay connected with Samuel Finance.", summary: "Find company announcements and perspectives as they are published by our team.", path: "/updates", action: "Explore updates" });
  if (!forms.length) forms.push({ id: "resource-library", category: "FORMS & RESOURCES", kind: "resource", title: "The right information. Your next step.", summary: "Explore our finance guides and find current forms as they become available.", path: "/loans", action: "Explore resources" });
  const slides = [];
  for (let index = 0; index < Math.max(news.length, forms.length); index++) {
    if (news[index]) slides.push(news[index]);
    if (forms[index]) slides.push(forms[index]);
  }
  return <div className="hero-highlights">
    <div className="hero-highlights-heading"><span className="eyebrow">AT A GLANCE</span><div><a href="/updates">News & updates</a><span aria-hidden="true">/</span><a href="/loans">Forms & resources</a></div></div>
    <HomeCarousel id="hero-highlights" label="Featured news and resources" variant="hero">
      {slides.map(slide => <article className="hero-highlight-card" key={slide.id}>
        <div className="hero-highlight-meta"><span className="eyebrow">{slide.kind === "news" ? <Newspaper size={14} /> : <FileText size={14} />}{slide.category}</span>{slide.date && <time dateTime={slide.date}>{dateLabel(slide.date)}</time>}</div>
        <h2><a href={slide.path}>{slide.title}</a></h2>
        <p>{slide.summary}</p>
        <div className="hero-highlight-actions"><a className="button forest" href={slide.path}>{slide.action}<ArrowUpRight size={16} /></a><ShareButton title={slide.title} path={slide.path} description={slide.summary} /></div>
      </article>)}
    </HomeCarousel>
  </div>;
}
