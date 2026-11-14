"use client";

import { MessageCircle, Phone, X } from "lucide-react";
import { useId, useRef, useState } from "react";

export default function ContactPopover({ phone, whatsapp }) {
  const [open, setOpen] = useState(false);
  const panelId = useId(), trigger = useRef(null);
  function close() { setOpen(false); trigger.current?.focus(); }

  const phoneHref = phone?.replace(/[^\d+]/g, "");
  const whatsappHref = whatsapp?.replace(/\D/g, "");

  return (
    <>
    <button ref={trigger} className="contact-launcher" type="button" aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={open ? "Hide contact details" : "Open contact details"} onClick={() => setOpen(value => !value)}><MessageCircle size={18} /><span>Talk to our team</span></button>
    {open && <aside
      id={panelId}
      className="contact-popover"
      role="dialog"
      aria-label="Contact Samuel Finance"
      onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}
    >
      <button
        className="contact-popover-close"
        type="button"
        onClick={close}
        autoFocus
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
    </aside>}
    </>
  );
}
