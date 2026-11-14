"use client";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

export default function HomeCarousel({ children, label, id, variant = "", transition = "slide" }) {
  const slides = Children.toArray(children), track = useRef(null), touchStart = useRef(null), swiped = useRef(false);
  const fade = transition === "fade";
  const [playing, setPlaying] = useState(true), [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [hidden, setHidden] = useState(false), [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState({ first: 0, last: 0, maximum: 0 });
  const measure = useCallback(() => {
    const node = track.current;
    if (!node || !node.children.length) return;
    if (fade) {
      setPosition(current => { const first = Math.min(current.first, slides.length - 1); return { first, last: first, maximum: slides.length - 1 }; });
      return;
    }
    const items = [...node.children], origin = items[0].offsetLeft, limit = Math.max(0, node.scrollWidth - node.clientWidth);
    const starts = items.map(item => item.offsetLeft - origin);
    const maximum = starts.findIndex(start => start >= limit - 2);
    const nearest = starts.reduce((best, start, i) => Math.abs(start - node.scrollLeft) < Math.abs(starts[best] - node.scrollLeft) ? i : best, 0);
    let last = nearest;
    items.forEach((item, i) => { if (starts[i] < node.scrollLeft + node.clientWidth - 4 && starts[i] + item.clientWidth > node.scrollLeft + 4) last = i; });
    setPosition({ first: nearest, last, maximum: limit < 2 ? 0 : maximum < 0 ? items.length - 1 : maximum });
  }, [fade, slides.length]);
  const move = useCallback(index => {
    const node = track.current;
    if (!node?.children.length) return;
    if (fade) {
      const next = Math.min(Math.max(index, 0), slides.length - 1);
      setPosition({ first: next, last: next, maximum: slides.length - 1 });
      return;
    }
    const target = node.children[Math.min(Math.max(index, 0), position.maximum)];
    node.scrollTo({ left: target.offsetLeft - node.children[0].offsetLeft, behavior: reduced ? "auto" : "smooth" });
  }, [position.maximum, reduced, fade, slides.length]);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => { setReduced(motion.matches); if (motion.matches) setPlaying(false); };
    const visibility = () => setHidden(document.hidden);
    preference(); visibility(); measure();
    motion.addEventListener("change", preference); document.addEventListener("visibilitychange", visibility);
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    const viewport = "IntersectionObserver" in window ? new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: 0.05 }) : null;
    if (track.current) viewport?.observe(track.current);
    return () => { observer.disconnect(); viewport?.disconnect(); motion.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, [measure]);
  useEffect(() => { measure(); }, [slides.length, measure]);
  useEffect(() => {
    if (!playing || hovered || focused || hidden || !visible || !position.maximum) return;
    const timer = setInterval(() => move(position.first >= position.maximum ? 0 : position.first + 1), 7000);
    return () => clearInterval(timer);
  }, [playing, hovered, focused, hidden, visible, position.first, position.maximum, move]);
  if (!slides.length) return null;
  const running = playing && !hovered && !focused && !hidden && visible;
  return <div className={`home-carousel ${variant ? `home-carousel-${variant}` : ""} ${fade ? "home-carousel-fade" : ""}`} data-active-index={position.first} role="region" aria-roledescription="carousel" aria-label={label} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="home-carousel-track" id={`${id}-track`} ref={track} onScroll={measure} tabIndex={0} aria-label={`${label}. Swipe or use the arrow keys to browse.`}
    onPointerDown={event => { swiped.current = false; if (fade && event.pointerType === "touch" && !event.target.closest("button,dialog,input,video")) touchStart.current = { x: event.clientX, y: event.clientY }; }}
    onPointerUp={event => { const start = touchStart.current; touchStart.current = null; if (!start) return; const dx = event.clientX - start.x, dy = event.clientY - start.y; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped.current = true; move(position.first + (dx < 0 ? 1 : -1)); } }}
    onPointerCancel={() => { touchStart.current = null; }}
    onClickCapture={event => { if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; } }}
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      move(event.key === "Home" ? 0 : event.key === "End" ? position.maximum : position.first + (event.key === "ArrowRight" ? 1 : -1));
    }} onFocusCapture={event => {
      if (event.target.closest("dialog")) return;
      const slide = event.target.closest(".home-carousel-slide");
      if (!slide || !track.current) return;
      const bounds = slide.getBoundingClientRect(), visible = track.current.getBoundingClientRect();
      if (bounds.left < visible.left - 2 || bounds.right > visible.right + 2) move([...track.current.children].indexOf(slide));
    }}>
      {slides.map((slide, index) => <div key={slide.key || index} className={`home-carousel-slide${index === position.first ? " is-current" : ""}`} inert={fade && index !== position.first ? true : undefined} aria-hidden={fade && index !== position.first ? true : undefined} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>{slide}</div>)}
    </div>
    {slides.length > 1 && position.maximum > 0 && <div className="home-carousel-controls">
      <div className="home-carousel-navigation"><button type="button" className="carousel-arrow" aria-label={`Previous ${label.toLowerCase()}`} aria-controls={`${id}-track`} disabled={position.first === 0} onClick={() => move(position.first - 1)}><ArrowLeft size={18} /></button><button type="button" className="carousel-arrow" aria-label={`Next ${label.toLowerCase()}`} aria-controls={`${id}-track`} disabled={position.first >= position.maximum} onClick={() => move(position.first + 1)}><ArrowRight size={18} /></button><span className="carousel-count" aria-live={running ? "off" : "polite"}>{position.first + 1}{position.last > position.first ? `–${position.last + 1}` : ""} <span>of {slides.length}</span></span></div>
      <div className="carousel-dots" aria-label={`Choose a ${label.toLowerCase()} position`}>{Array.from({ length: position.maximum + 1 }, (_, i) => <button key={i} type="button" aria-label={`Show ${label.toLowerCase()} from item ${i + 1}`} aria-controls={`${id}-track`} aria-pressed={position.first === i} onClick={() => move(i)}><span /></button>)}</div>
      <button type="button" className="carousel-play" aria-label={`${playing ? "Pause" : "Play"} ${label.toLowerCase()} slideshow`} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}<span>{playing ? "Pause slides" : "Play slides"}</span></button>
    </div>}
    {position.maximum > 0 && <div className="carousel-position-rail" aria-hidden="true"><span style={{ width: `${(position.first + 1) / (position.maximum + 1) * 100}%` }} /></div>}
  </div>;
}
