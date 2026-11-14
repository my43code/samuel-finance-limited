"use client";
import { useState } from "react";
import { Check, ArrowUpRight, RotateCcw } from "lucide-react";

const steps = [
  ["A clear purpose", "Write down what you need the funds for and the amount you want to discuss."],
  ["A realistic budget", "Consider your income, living costs, existing repayments and a buffer for unexpected expenses."],
  ["Questions about the full cost", "Ask about interest, all fees, repayment dates and the total amount repayable."],
  ["The right next step", "Confirm current availability, requirements and a secure way to provide documents with our team."],
];

export default function EnquiryChecklist({ email }) {
  const [checked, setChecked] = useState([]);
  return <div className="enquiry-checklist">
    <div className="checklist-heading"><span className="eyebrow">YOUR CONVERSATION STARTER</span><span className="checklist-count" role="status" aria-live="polite">{checked.length} of {steps.length} considered</span></div>
    <h3>A little preparation.<br /><em>A clearer conversation.</em></h3>
    <p>Work through these prompts before getting in touch. Your selections stay on this page and reset when you leave.</p>
    <div className="checklist-progress" aria-hidden="true"><span style={{ width: `${checked.length / steps.length * 100}%` }} /></div>
    <div className="checklist-options">{steps.map(([title, detail], index) => <label key={title}>
      <input type="checkbox" checked={checked.includes(index)} onChange={e => setChecked(items => e.target.checked ? [...items, index] : items.filter(i => i !== index))} />
      <span className="checklist-box" aria-hidden="true"><Check size={15} /></span><span><strong>{title}</strong><small>{detail}</small></span>
    </label>)}</div>
    {checked.length === steps.length && <p className="checklist-complete" role="status">You have considered the key questions. Our team can help clarify the next steps; this checklist does not assess eligibility.</p>}
    <div className="checklist-actions"><a className="button forest" href={`mailto:${email}?subject=${encodeURIComponent("An enquiry about finance")}`}>Start a conversation <ArrowUpRight size={16} /></a>{checked.length > 0 && <button type="button" className="text-link" onClick={() => setChecked([])}><RotateCcw size={14} /> Reset</button>}</div>
  </div>;
}
