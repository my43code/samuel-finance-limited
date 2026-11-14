"use client";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

export default function HomeCarousel({ children, label, id, variant = "" }) {
  const slides = Children.toArray(children), track = useRef(null);
  const [playing, setPlaying] = useState(true), [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false), [hidden, setHidden] = useState(false), [reduced, setReduced] = useState(false);
  const [position, setPosition] = useState({ first: 0, last: 0, maximum: 0 });
  const measure = useCallback(() => {
    const node = track.current;
    if (!node || !node.children.length) return;
    const items = [...node.children], origin = items[0].offsetLeft, limit = Math.max(0, node.scrollWidth - node.clientWidth);
    const starts = items.map(item => item.offsetLeft - origin);
    const maximum = starts.findIndex(start => start >= limit - 2);
    const nearest = starts.reduce((best, start, i) => Math.abs(start - node.scrollLeft) < Math.abs(starts[best] - node.scrollLeft) ? i : best, 0);
    let last = nearest;
    items.forEach((item, i) => { if (starts[i] < node.scrollLeft + node.clientWidth - 4 && starts[i] + item.clientWidth > node.scrollLeft + 4) last = i; });
    setPosition({ first: nearest, last, maximum: limit < 2 ? 0 : maximum < 0 ? items.length - 1 : maximum });
  }, []);
  const move = useCallback(index => {
    const node = track.current;
    if (!node?.children.length) return;
    const target = node.children[Math.min(Math.max(index, 0), position.maximum)];
    node.scrollTo({ left: target.offsetLeft - node.children[0].offsetLeft, behavior: reduced ? "auto" : "smooth" });
  }, [position.maximum, reduced]);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => { setReduced(motion.matches); if (motion.matches) setPlaying(false); };
    const visibility = () => setHidden(document.hidden);
    preference(); visibility(); measure();
    motion.addEventListener("change", preference); document.addEventListener("visibilitychange", visibility);
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    return () => { observer.disconnect(); motion.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, [measure]);
  useEffect(() => { measure(); }, [slides.length, measure]);
  useEffect(() => {
    if (!playing || hovered || focused || hidden || !position.maximum) return;
    const timer = setInterval(() => move(position.first >= position.maximum ? 0 : position.first + 1), 7000);
    return () => clearInterval(timer);
  }, [playing, hovered, focused, hidden, position.first, position.maximum, move]);
  if (!slides.length) return null;
  const running = playing && !hovered && !focused && !hidden;
  return <div className={`home-carousel ${variant ? `home-carousel-${variant}` : ""}`} role="region" aria-roledescription="carousel" aria-label={label} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="home-carousel-track" id={`${id}-track`} ref={track} onScroll={measure} tabIndex={0} aria-label={`${label}. Swipe or use the arrow keys to browse.`} onKeyDown={event => {
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
      {slides.map((slide, index) => <div key={slide.key || index} className="home-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>{slide}</div>)}
    </div>
    {slides.length > 1 && position.maximum > 0 && <div className="home-carousel-controls">
      <div className="home-carousel-navigation"><button type="button" className="carousel-arrow" aria-label={`Previous ${label.toLowerCase()}`} aria-controls={`${id}-track`} disabled={position.first === 0} onClick={() => move(position.first - 1)}><ArrowLeft size={18} /></button><button type="button" className="carousel-arrow" aria-label={`Next ${label.toLowerCase()}`} aria-controls={`${id}-track`} disabled={position.first >= position.maximum} onClick={() => move(position.first + 1)}><ArrowRight size={18} /></button><span className="carousel-count" aria-live={running ? "off" : "polite"}>{position.first + 1}{position.last > position.first ? `–${position.last + 1}` : ""} <span>of {slides.length}</span></span></div>
      <div className="carousel-dots" aria-label={`Choose a ${label.toLowerCase()} position`}>{Array.from({ length: position.maximum + 1 }, (_, i) => <button key={i} type="button" aria-label={`Show ${label.toLowerCase()} from item ${i + 1}`} aria-controls={`${id}-track`} aria-pressed={position.first === i} onClick={() => move(i)}><span /></button>)}</div>
      <button type="button" className="carousel-play" aria-label={`${playing ? "Pause" : "Play"} ${label.toLowerCase()} slideshow`} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}<span>{playing ? "Pause slides" : "Play slides"}</span></button>
    </div>}
  </div>;
}
