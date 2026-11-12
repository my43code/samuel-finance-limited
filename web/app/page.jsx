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
} from "lucide-react";
import { publicData } from "../lib/public-data";
import { mediaUrl } from "../lib/defaults";
import { PublicShell } from "../components/public-shell";
import { UpdateCard, EntryMedia, PublicEmpty } from "../components/content";
export const dynamic = "force-dynamic";
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
  const updates = entries.filter((e) => e.kind === "update").slice(0, 3);
  const media = entries.filter((e) => e.kind === "media").slice(0, 4);
  return (
    <PublicShell company={company}>
      <main id="main">
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
              <a className="text-link" href="/loans">
                Application resources <ArrowUpRight size={15} />
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
            <div className="leadership-grid">
              {leadership.map((leader, index) => {
                const image = leader.media?.mime?.startsWith("image/");
                return (
                  <article
                    className={`leader-card ${index === 0 ? "featured" : ""}`}
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
            <a className="text-link" href="/updates">
              All updates <ArrowUpRight size={17} />
            </a>
          </div>
          {updates.length ? (
            <div className="updates-grid">
              {updates.map((e) => (
                <UpdateCard key={e.id} entry={e} />
              ))}
            </div>
          ) : (
            <PublicEmpty title="Our next chapter, shared here.">
              Company announcements and perspectives will appear here as they
              are published. Contact our team for current information.
            </PublicEmpty>
          )}
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
          </div>
          <div className="resources-lines">
            <a href="/loans">
              <span>
                <small>01 / RESOURCES</small>Loan application forms
              </span>
              <ArrowUpRight size={24} />
            </a>
            <a href="/careers">
              <span>
                <small>02 / OPPORTUNITIES</small>Build your career with us
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
