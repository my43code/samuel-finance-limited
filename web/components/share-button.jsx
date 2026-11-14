"use client";
import { useId, useRef, useState } from "react";
import { Share2, Link2, Check, X, Mail, MessageCircle, ExternalLink, Smartphone } from "lucide-react";
import FacebookIcon from "./facebook-icon";

export default function ShareButton({ title, path, description = "", label = "Share", className = "" }) {
  const dialog = useRef(null), input = useRef(null);
  const heading = useId();
  const [url, setUrl] = useState(""), [message, setMessage] = useState(""), [copied, setCopied] = useState(false), [native, setNative] = useState(false);
  function open() {
    setUrl(new URL(path, window.location.origin).href);
    setMessage(""); setCopied(false); setNative(typeof navigator.share === "function");
    dialog.current.showModal();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true); setMessage("Link copied. Ready to paste and share.");
    } catch {
      input.current.focus(); input.current.select();
      setMessage("Copy the selected link using your device’s copy command.");
    }
  }
  async function nativeShare() {
    try { await navigator.share({ title, text: description || title, url }); }
    catch (error) { if (error.name !== "AbortError") setMessage("Device sharing is unavailable. Choose an option below or copy the link."); }
  }
  const encoded = encodeURIComponent(url), caption = encodeURIComponent(`${title}\n${url}`);
  return <>
    <button type="button" className={`share-trigger ${className}`} onClick={open} aria-label={`Share ${title}`}><Share2 size={15} /><span>{label}</span></button>
    <dialog ref={dialog} className="share-dialog" aria-labelledby={heading} onClick={e => { if (e.target === dialog.current) { const r = dialog.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.current.close(); } }}>
      <div className="share-dialog-inner"><button type="button" autoFocus className="share-close" aria-label="Close sharing options" onClick={() => dialog.current.close()}><X size={20} /></button>
        <span className="eyebrow">A CONVERSATION WORTH SHARING</span><h2 id={heading}>Share this with someone.</h2><p className="share-title">{title}</p>
        <div className="share-options">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer"><FacebookIcon size={21} /><span>Facebook</span><ExternalLink size={13} /></a>
          <a href={`https://wa.me/?text=${caption}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={21} /><span>WhatsApp</span><ExternalLink size={13} /></a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer"><span className="linkedin-mark" aria-hidden="true">in</span><span>LinkedIn</span><ExternalLink size={13} /></a>
          <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`}><Mail size={21} /><span>Email</span><ExternalLink size={13} /></a>
        </div>
        <label className="share-link-label" htmlFor={`${heading}-link`}>Direct link</label><div className="share-copy"><input ref={input} id={`${heading}-link`} readOnly value={url} onFocus={e => e.target.select()} /><button type="button" onClick={copy}>{copied ? <Check size={16} /> : <Link2 size={16} />}{copied ? "Copied" : "Copy link"}</button></div>
        {native && <button type="button" className="native-share" onClick={nativeShare}><Smartphone size={16} /> More sharing options on your device <Share2 size={14} /></button>}
        <p className="share-feedback" role="status" aria-live="polite">{message}</p><span className="share-brand">SAMUEL FINANCE LIMITED</span>
      </div>
    </dialog>
  </>;
}
