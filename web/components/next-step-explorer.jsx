"use client";
import { useId, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, FileText, MessagesSquare, Check } from "lucide-react";

const paths = [
  { label: "Explore finance", icon: MessagesSquare, eyebrow: "START WITH UNDERSTANDING", title: "A clearer conversation starts here.", text: "Get familiar with borrowing, consider the questions that matter and speak with our team about current availability.", points: ["Understand the full cost of borrowing", "Prepare your questions before enquiring"], href: "/guides/borrowing-basics", action: "Explore borrowing basics", secondary: "/#contact", secondaryLabel: "Speak with our team" },
  { label: "Find a form", icon: FileText, eyebrow: "PREPARE YOUR NEXT STEP", title: "The information you need, within reach.", text: "Find published documents, read the instructions and confirm the right form and submission process with our team.", points: ["Search the published resource library", "Read, download and share current documents"], href: "/loans", action: "Browse forms & resources", secondary: "/guides/preparing-an-enquiry", secondaryLabel: "Prepare an enquiry" },
  { label: "Stay informed", icon: BookOpen, eyebrow: "FOLLOW OUR NEXT CHAPTER", title: "Keep a closer view of Samuel Finance.", text: "Explore company announcements, meet our team and share useful updates with the people who matter to you.", points: ["Read published company news", "Share updates directly from each article"], href: "/updates", action: "Read news & updates", secondary: "/#leadership", secondaryLabel: "Meet our team" },
];

export default function NextStepExplorer() {
  const [selected, setSelected] = useState(0);
  const identity = useId(), tabs = useRef([]);
  function navigate(event, index) {
    const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? paths.length - 1 : (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + paths.length) % paths.length;
    setSelected(next); tabs.current[next]?.focus();
  }
  return <section className="next-step-explorer" aria-labelledby={`${identity}-heading`}>
    <div className="explorer-intro"><span className="eyebrow">A PLACE TO BEGIN</span><h2 id={`${identity}-heading`}>What brings<br /> you <em>here today?</em></h2><p>Choose a path. Find the information that moves your conversation forward.</p></div>
    <div className="explorer-workspace"><div className="explorer-tabs" role="tablist" aria-label="Choose your next step">{paths.map((path, index) => <button key={path.label} ref={node => { tabs.current[index] = node; }} role="tab" id={`${identity}-tab-${index}`} aria-selected={selected === index} aria-controls={`${identity}-panel-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => navigate(event, index)}><path.icon size={19} /><span>{path.label}</span><ArrowUpRight size={15} /></button>)}</div>
      {paths.map((path, index) => <div key={path.label} className="explorer-panel" id={`${identity}-panel-${index}`} role="tabpanel" aria-labelledby={`${identity}-tab-${index}`} hidden={selected !== index} tabIndex={0}>
        <span className="eyebrow">{path.eyebrow}</span><h3>{path.title}</h3><p>{path.text}</p><ul>{path.points.map(point => <li key={point}><Check size={14} />{point}</li>)}</ul><div className="explorer-actions"><a className="button forest" href={path.href}>{path.action}<ArrowUpRight size={16} /></a><a className="text-link" href={path.secondary}>{path.secondaryLabel}<ArrowUpRight size={14} /></a></div>
      </div>)}
    </div>
  </section>;
}
