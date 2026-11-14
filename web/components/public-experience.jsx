"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
export default function PublicExperience() {
  const [progress, setProgress] = useState(0), [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const measure = () => { const distance = document.documentElement.scrollHeight - window.innerHeight; setProgress(distance > 0 ? Math.min(1, window.scrollY / distance) : 0); setScrolled(window.scrollY > 650); };
    let frame;
    const scroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure(); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("resize", scroll);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer;
    if (!reduce && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: 0.06 });
      document.querySelectorAll('.company-section, .approach-section, .leadership-section, .news-section, .resources-band, .gallery-section').forEach(section => { if(section.getBoundingClientRect().top > window.innerHeight) { section.classList.add("reveal-section"); observer.observe(section); } });
    }
    const currentPath = window.location.pathname;
    document.querySelectorAll('.public-header nav a').forEach(a => { const path = new URL(a.href).pathname; if(path !== '/' && (currentPath === path || currentPath.startsWith(path + '/'))) a.setAttribute('aria-current','page'); });
    return () => { window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); cancelAnimationFrame(frame); observer?.disconnect(); document.querySelectorAll('.reveal-section').forEach(s => s.classList.remove('reveal-section')); };
  }, []);
  return <><div className="reading-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} /><a className={`back-to-top ${scrolled ? "visible" : ""}`} href="#main" aria-label="Back to top" tabIndex={scrolled ? 0 : -1}><ArrowUp size={18} /></a></>;
}
