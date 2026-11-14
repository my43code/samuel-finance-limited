import {
  ArrowUpRight,
  ArrowDown,
  ShieldCheck,
  MessagesSquare,
  Compass,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  BookOpen,
} from "lucide-react";
import { publicData } from "../lib/public-data";
import { mediaUrl } from "../lib/defaults";
import { PublicShell } from "../components/public-shell";
import FacebookIcon from "../components/facebook-icon";
import { UpdateCard, EntryMedia, PublicEmpty, dateLabel } from "../components/content";
import ShareButton from "../components/share-button";
import HomeCarousel from "../components/home-carousel";
import { GettingStarted, FinanceFaq } from "../components/finance-information";
import { guides } from "../lib/guides";
export const dynamic = "force-dynamic";
export const metadata = {
  title: { absolute: "Samuel Finance Limited | Finance information in Papua New Guinea" },
  description: "Get to know Samuel Finance Limited. Explore finance guides, published application forms, company news and careers in Papua New Guinea, and speak with our team.",
  alternates: { canonical: "/" },
  openGraph: { title: "Samuel Finance Limited", description: "A considered approach to finance in Papua New Guinea. Company information, helpful guides and published resources.", url: "/", images: ["/assets/mountains.jpg"] },
};
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
export default async function Home() {
  const { company, entries, leadership } = await publicData();
  const updates = entries.filter((e) => e.kind === "update").slice(0, 9);
  const resources = entries.filter((e) => e.kind === "document" && e.media_id).slice(0, 7);
  const media = entries.filter((e) => e.kind === "media").slice(0, 4);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://samuelfinancelimited.com/#organization", name: company.name, url: "https://samuelfinancelimited.com", logo: "https://samuelfinancelimited.com/assets/logo.png", description: company.introduction, email: company.email, telephone: company.phone, ...(company.facebook ? { sameAs: [company.facebook] } : {}) },
      { "@type": "WebSite", "@id": "https://samuelfinancelimited.com/#website", url: "https://samuelfinancelimited.com", name: company.name, inLanguage: "en", publisher: { "@id": "https://samuelfinancelimited.com/#organization" } },
    ],
  };
  return (
    <PublicShell company={company}>
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <section className="home-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              ROOTED IN PURPOSE. FOCUSED ON PEOPLE.
            </span>
            <h1>
              A strong foundation.
              <br />A <em>considered</em>
              <br />
              way forward.
            </h1>
            <p>{company.introduction}</p>
            <div className="hero-actions">
              <a className="button forest" href="#company">
                Discover Samuel Finance <ArrowUpRight size={17} />
              </a>
              <a className="text-link" href="#getting-started">
                Plan your next step <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="hero-note">
              <span className="tiny-dot" /> Building relationships across Papua
              New Guinea
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/assets/mountains.jpg"
              alt="Sunlight on a mountain summit"
              fetchPriority="high"
            />
            <div className="hero-image-label">
              <span>RESILIENCE. INTEGRITY. PROGRESS.</span>
              <span>01 / OUR FOUNDATION</span>
            </div>
            <div className="hero-image-card">
              <span className="eyebrow">OUR GUIDING PRINCIPLE</span>
              <p>
                Progress is stronger
                <br />
                when it starts with <em>trust.</em>
              </p>
              <ArrowUpRight size={27} />
            </div>
          </div>
        </section>
        <div className="values-ribbon">
          <span>THE SAMUEL FINANCE APPROACH</span>
          <strong>
            <ShieldCheck size={19} /> Integrity in every interaction
          </strong>
          <strong>
            <MessagesSquare size={19} /> Clear, open communication
          </strong>
          <strong>
            <Compass size={19} /> Purposeful decisions
          </strong>
        </div>
        {updates[0] && <div className="latest-announcement"><span><i /> LATEST FROM SAMUEL FINANCE</span><a href={`/updates/${updates[0].id}`}>{updates[0].title}<ArrowUpRight size={17} /></a><a className="announcement-all" href="/updates">All updates <ArrowUpRight size={14} /></a></div>}
        <section className="corporate-shortcuts" aria-label="Explore Samuel Finance">
          <a href="#company"><span>01 / WHO WE ARE</span><strong>A foundation of trust.</strong><p>Our purpose, principles and approach to finance.</p><ArrowUpRight size={22} /></a>
          <a href="#getting-started"><span>02 / GET PREPARED</span><strong>Clarity before commitment.</strong><p>Useful guides, practical questions and a preparation checklist.</p><ArrowUpRight size={22} /></a>
          <a href="/loans"><span>03 / TAKE THE NEXT STEP</span><strong>Information within reach.</strong><p>Published forms and resources, ready to share.</p><ArrowUpRight size={22} /></a>
        </section>
        <section className="public-section company-section" id="company">
          <div>
            <span className="eyebrow">01 / OUR COMPANY</span>
            <h2>
              Strong roots.
              <br />
              <em>Thoughtful ambition.</em>
            </h2>
            <a className="text-link" href="#contact">
              Get to know our team <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="company-story">
            <p className="lead">{company.tagline}</p>
            <p>{company.about}</p>
            <div className="mission">
              <span className="eyebrow">OUR PURPOSE</span>
              <p>{company.mission}</p>
            </div>
          </div>
        </section>
        <section className="approach-section" id="approach">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / OUR APPROACH</span>
              <h2>
                People first.
                <br />
                <em>Principles always.</em>
              </h2>
            </div>
            <p>
              The fundamentals matter. Our approach is shaped by the quality of
              our conversations and the care behind our decisions.
            </p>
          </div>
          <div className="approach-grid">
            {[
              [
                "01",
                "A clearer conversation",
                "Straightforward information, time for questions and an understanding of what matters to you.",
                MessagesSquare,
              ],
              [
                "02",
                "A responsible approach",
                "Careful consideration of individual circumstances and transparent discussion of the next steps.",
                ShieldCheck,
              ],
              [
                "03",
                "A lasting relationship",
                "Respectful communication and accountable service, from the first enquiry onward.",
                Compass,
              ],
            ].map(([n, t, p, Icon]) => (
              <article key={n}>
                <div>
                  <Icon size={25} />
                  <span>{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <GettingStarted email={company.email} />
        {leadership.length > 0 && (
          <section
            className="public-section leadership-section"
            id="leadership"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">03 / LEADERSHIP</span>
                <h2>
                  People behind the
                  <br />
                  <em>purpose.</em>
                </h2>
              </div>
              <p>
                Meet the people entrusted with shaping Samuel Finance and
                building a thoughtful, accountable way forward.
              </p>
            </div>
            <div className={`leadership-grid${leadership.length === 2 ? " leadership-grid-pair" : leadership.length === 1 ? " leadership-grid-single" : ""}`}>
              {leadership.map((leader, index) => {
                const image = leader.media?.mime?.startsWith("image/");
                return (
                  <article
                    className="leader-card"
                    key={leader.id}
                  >
                    <div className="leader-photo">
                      {image ? (
                        <img
                          src={mediaUrl(leader.media_id)}
                          alt={
                            leader.media.alt_text ||
                            `${leader.name}, ${leader.role}`
                          }
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      ) : (
                        <span aria-hidden="true">{initials(leader.name)}</span>
                      )}
                    </div>
                    <div className="leader-copy">
                      <span className="eyebrow">LEADERSHIP</span>
                      <h3>{leader.name}</h3>
                      <strong>{leader.role}</strong>
                      {leader.bio && <p>{leader.bio}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        <section className="public-section news-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">04 / FROM SAMUEL FINANCE</span>
              <h2>
                News, perspectives
                <br />& <em>company updates.</em>
              </h2>
            </div>
            <div className="section-heading-actions"><a className="text-link" href="/updates">
              All updates <ArrowUpRight size={17} />
            </a><ShareButton title="Samuel Finance news & updates" path="/updates" label="Share news" /></div>
          </div>
          {updates.length ? (
            <HomeCarousel id="homepage-news" label="Latest news and updates">
              {updates.map((e) => (
                <UpdateCard key={e.id} entry={e} />
              ))}
            </HomeCarousel>
          ) : (
            <PublicEmpty title="Our next chapter, shared here.">
              Company announcements and perspectives will appear here as they
              are published. Contact our team for current information.
            </PublicEmpty>
          )}
        </section>
        <section className="public-section home-resources-section" id="resources">
          <div className="section-heading"><div><span className="eyebrow">EXPLORE. PREPARE. MOVE FORWARD.</span><h2>Useful resources.<br /><em>Within easy reach.</em></h2></div><div className="section-heading-actions"><a className="text-link" href="/loans">All forms & resources <ArrowUpRight size={17} /></a><ShareButton title="Samuel Finance forms & resources" path="/loans" label="Share resources" /></div></div>
          <p className="home-resources-intro">Browse published forms and plain-English guides. Swipe to explore, or use the arrows to find your next step.</p>
          <HomeCarousel id="homepage-resources" label="Forms, resources and finance guides" variant="resources">
            {resources.map(entry => <article className="home-resource-card" key={entry.id}><div className="resource-card-top"><span><FileText size={27} /></span><span className="eyebrow">PUBLISHED PDF</span></div><span className="resource-card-type">{dateLabel(entry.published_at)}</span><h3><a href={`/loans/${entry.id}`}>{entry.title}</a></h3><p>{entry.summary || "Read the instructions and download the current published document."}</p><a className="text-link" href={`/loans/${entry.id}`}>View resource <ArrowUpRight size={16} /></a><div className="resource-card-actions"><a href={`${mediaUrl(entry.media_id)}?download=1`} className="resource-download"><Download size={15} /> Download PDF</a><ShareButton title={entry.title} path={`/loans/${entry.id}`} description={entry.summary} /></div></article>)}
            {guides.map(guide => <article className="home-resource-card guide-resource-card" key={guide.slug}><div className="resource-card-top"><span><BookOpen size={27} /></span><span className="eyebrow">FINANCE GUIDE</span></div><span className="resource-card-type">{guide.readTime}</span><h3><a href={`/guides/${guide.slug}`}>{guide.title}</a></h3><p>{guide.summary}</p><a className="text-link" href={`/guides/${guide.slug}`}>Read the guide <ArrowUpRight size={16} /></a><div className="resource-card-actions"><span className="resource-guide-note">A more informed next step</span><ShareButton title={guide.title} path={`/guides/${guide.slug}`} description={guide.summary} /></div></article>)}
            <article className="home-resource-card guide-resource-card" key="preparation-tool"><div className="resource-card-top"><span><ShieldCheck size={27} /></span><span className="eyebrow">INTERACTIVE CHECKLIST</span></div><span className="resource-card-type">Four prompts to consider</span><h3><a href="#getting-started">Ready for a conversation?</a></h3><p>Work through the key questions about your purpose, budget, costs and next steps. No personal details needed.</p><a className="text-link" href="#getting-started">Explore the checklist <ArrowUpRight size={16} /></a><div className="resource-card-actions"><span className="resource-guide-note">Prepare at your own pace</span><ShareButton title="Prepare for a finance conversation" path="/#getting-started" /></div></article>
            <article className="home-resource-card" key="forms-library"><div className="resource-card-top"><span><FileText size={27} /></span><span className="eyebrow">RESOURCE LIBRARY</span></div><span className="resource-card-type">Published by our team</span><h3><a href="/loans">Find the right form.</a></h3><p>Browse the latest published documents, search for a resource and read the instructions before downloading.</p><a className="text-link" href="/loans">Browse all resources <ArrowUpRight size={16} /></a><div className="resource-card-actions"><span className="resource-guide-note">Current published versions</span><ShareButton title="Samuel Finance forms & resources" path="/loans" /></div></article>
          </HomeCarousel>
        </section>
        {media.length > 0 && (
          <section className="public-section gallery-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">LIFE AT SAMUEL FINANCE</span>
                <h2>
                  Our story, <em>in focus.</em>
                </h2>
              </div>
            </div>
            <div className="public-gallery">
              {media.map((e) => (
                <figure key={e.id}>
                  <EntryMedia entry={e} />
                  <figcaption>
                    <strong>{e.title}</strong>
                    <span>{e.summary}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        <section className="resources-band">
          <div>
            <span className="eyebrow">INFORMATION FOR YOUR NEXT STEP</span>
            <h2>
              Start with the
              <br />
              <em>right information.</em>
            </h2>
            <p>
              Find available loan application forms, read the instructions and
              speak with our team before providing personal information.
            </p>
            <a className="button gold" href="/loans">
              Forms & resources <Download size={16} />
            </a>
            <ShareButton title="Samuel Finance forms & resources" path="/loans" label="Share resources" className="share-on-dark" />
          </div>
          <div className="resources-lines">
            <a href="/loans">
              <span>
                <small>01 / RESOURCES</small>Loan application forms
              </span>
              <ArrowUpRight size={24} />
            </a>
            <a href="/guides/borrowing-basics">
              <span>
                <small>02 / UNDERSTANDING FINANCE</small>Borrowing basics, explained
              </span>
              <ArrowUpRight size={24} />
            </a>
            <a href="#contact">
              <span>
                <small>03 / CONVERSATION</small>Speak with our team
              </span>
              <ArrowUpRight size={24} />
            </a>
          </div>
        </section>
        <FinanceFaq />
        <section className="public-section contact-section" id="contact">
          <div>
            <span className="eyebrow">05 / LET’S CONNECT</span>
            <h2>
              Every relationship
              <br />
              starts with a <em>conversation.</em>
            </h2>
            <p>
              Company information, business enquiries or questions about our
              approach. We’re here to listen.
            </p>
            <a className="button forest" href={`mailto:${company.email}`}>
              Email our team <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="contact-list">
            <a href={`mailto:${company.email}`}>
              <Mail size={22} />
              <span>
                <small>EMAIL</small>
                {company.email}
              </span>
              <ArrowUpRight size={20} />
            </a>
            <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}>
              <Phone size={22} />
              <span>
                <small>PHONE</small>
                {company.phone}
              </span>
              <ArrowUpRight size={20} />
            </a>
            <div>
              <MapPin size={22} />
              <span>
                <small>OUR FOCUS</small>
                {company.address}
                <small className="hours">{company.hours}</small>
              </span>
            </div>
            {company.whatsapp && (
              <a
                className="contact-whatsapp"
                href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue the conversation on WhatsApp <ArrowUpRight size={16} />
              </a>
            )}
            {company.facebook && (
              <a href={company.facebook} target="_blank" rel="noopener noreferrer">
                <FacebookIcon size={22} />
                <span><small>FACEBOOK</small>Follow Samuel Finance Limited</span>
                <ArrowUpRight size={20} />
              </a>
            )}
          </div>
        </section>
        <div className="public-notice">
          <ShieldCheck size={20} />
          <p>
            Product availability, eligibility and terms are confirmed directly
            by our team. Website information and downloadable forms do not
            constitute a loan offer or approval.
          </p>
        </div>
      </main>
    </PublicShell>
  );
}
