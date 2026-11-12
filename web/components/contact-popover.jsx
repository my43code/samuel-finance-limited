"use client";

import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

export default function ContactPopover({ phone, whatsapp }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const phoneHref = phone?.replace(/[^\d+]/g, "");
  const whatsappHref = whatsapp?.replace(/\D/g, "");

  return (
    <aside
      className="contact-popover"
      role="dialog"
      aria-label="Contact Samuel Finance"
    >
      <button
        className="contact-popover-close"
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close contact details"
      >
        <X size={17} />
      </button>
      <span className="eyebrow">LET&apos;S CONNECT</span>
      <strong>Have a question?</strong>
      <p>Speak with our team directly.</p>
      <div className="contact-popover-links">
        {phone && phoneHref && (
          <a href={`tel:${phoneHref}`}>
            <Phone size={15} />
            <span>
              <small>CALL US</small>
              {phone}
            </span>
          </a>
        )}
        {whatsapp && whatsappHref && (
          <a
            href={`https://wa.me/${whatsappHref}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} />
            <span>
              <small>WHATSAPP</small>
              {whatsapp}
            </span>
          </a>
        )}
      </div>
    </aside>
  );
}
