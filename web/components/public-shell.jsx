import { ArrowUpRight, Mail, Phone, LockKeyhole, MapPin } from "lucide-react";
import Brand from "./brand";
import ContactPopover from "./contact-popover";
export function PublicHeader() {
  return (
    <>
      <div className="public-utility">
        <span>THOUGHTFUL FINANCE. LASTING RELATIONSHIPS.</span>
        <span>
          Papua New Guinea <span className="tiny-dot" />
        </span>
      </div>
      <header className="public-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="/#company">Our company</a>
          <a href="/#approach">Our approach</a>
          <a href="/#leadership">Our team</a>
          <a href="/updates">News & updates</a>
          <a href="/careers">Careers</a>
          <a href="/loans">Forms & resources</a>
        </nav>
        <a className="button forest contact-button" href="/#contact">
          Let’s talk <ArrowUpRight size={16} />
        </a>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">Menu ☰</summary>
          <nav>
            <a href="/#company">Our company</a>
            <a href="/#leadership">Our team</a>
            <a href="/updates">News & updates</a>
            <a href="/careers">Careers</a>
            <a href="/loans">Forms & resources</a>
            <a href="/#contact">Contact us</a>
            <a href="/admin/login">Administrator sign-in</a>
          </nav>
        </details>
      </header>
    </>
  );
}
export function PublicFooter({ company }) {
  return (
    <footer className="public-footer">
      <div className="footer-main">
        <div>
          <Brand light />
          <p>
            A foundation of trust.
            <br />A considered way forward.
          </p>
        </div>
        <div>
          <span className="eyebrow">EXPLORE</span>
          <a href="/#company">Our company</a>
          <a href="/#leadership">Our team</a>
          <a href="/updates">News & updates</a>
          <a href="/careers">Careers</a>
          <a href="/loans">Loan application forms</a>
        </div>
        <div>
          <span className="eyebrow">GET IN TOUCH</span>
          <a href={`mailto:${company.email}`}>
            <Mail size={15} />
            {company.email}
          </a>
          <a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`}>
            <Phone size={15} />
            {company.phone}
          </a>
          <span className="footer-location">
            <MapPin size={15} />
            {company.address}
          </span>
        </div>
      </div>
      <div className="footer-legal">
        <span>
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/admin/login">
            <LockKeyhole size={12} />
            Administrator sign-in
          </a>
        </div>
      </div>
    </footer>
  );
}
export function PublicShell({ children, company }) {
  return (
    <div className="public-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <PublicHeader />
      {children}
      <PublicFooter company={company} />
      <ContactPopover phone={company.phone} whatsapp={company.whatsapp} />
    </div>
  );
}
