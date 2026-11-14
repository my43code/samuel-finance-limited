import { ArrowUpRight, Plus, MessagesSquare, FileCheck2, ClipboardList, ShieldCheck } from "lucide-react";
import EnquiryChecklist from "./enquiry-checklist";

export function GettingStarted({ email }) {
  return <section className="getting-started public-section" id="getting-started">
    <div className="getting-started-copy"><span className="eyebrow">A MORE INFORMED NEXT STEP</span><h2>Good questions.<br /><em>Better understanding.</em></h2><p className="section-lead">Whether you are exploring finance for the first time or preparing an enquiry, start with the information that matters.</p>
      <ol className="enquiry-steps">{[
        [MessagesSquare, "Talk through your needs", "Explain your purpose and ask which options, if any, are currently available."],
        [ClipboardList, "Understand the details", "Ask for the eligibility criteria, document checklist, repayment schedule and all costs in writing."],
        [FileCheck2, "Consider your next step", "Read the documents, ask about anything unclear and confirm how to submit information securely."],
      ].map(([Icon, title, text], i) => <li key={title}><span><Icon size={21} /></span><div><small>STEP 0{i + 1}</small><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      <a className="text-link" href="/guides/preparing-an-enquiry">Read the preparation guide <ArrowUpRight size={16} /></a>
    </div><EnquiryChecklist email={email} />
  </section>;
}

export const financeFaqs = [
  ["How do I enquire about finance?", "Contact our team using the email, phone or WhatsApp details on this website. Describe what you would like to discuss and ask about current availability and the next steps. A conversation or downloaded form is not a loan approval."],
  ["Where can I find application forms?", "Published forms appear in Forms & resources. Open a resource to read its instructions and download the PDF. If the form you need is not listed, ask our team for the current version."],
  ["What information should I prepare?", "Start with your purpose, the amount you wish to discuss, and a realistic picture of your income, expenses and existing commitments. Ask our team which identity, income or other documents are needed for the option being discussed."],
  ["How can I find out the rates, fees and eligibility criteria?", "Ask our team for current written information on availability, interest, fees, eligibility and repayment terms. These details depend on the product and assessment. Review the total amount repayable and repayment schedule before deciding."],
  ["Can I submit a completed loan application on this website?", "This public website provides information and downloadable resources. It does not accept completed loan applications or identity-document uploads. Contact our team to confirm an appropriate submission process."],
  ["How can I stay up to date?", "Visit News & updates for published company announcements and follow the official Facebook link in our contact details. You can share updates and resource pages through their Share buttons."],
];

export function FinanceFaq() {
  return <section className="finance-faq public-section" id="questions"><div><span className="eyebrow">HELPFUL ANSWERS</span><h2>A clearer view.<br /><em>Before you begin.</em></h2><p>Practical answers to common questions, with a team you can speak to when you need more detail.</p><a className="text-link" href="/#contact">Ask our team <ArrowUpRight size={16} /></a><div className="faq-assurance"><ShieldCheck size={20} /><span>Take time to read, understand and ask questions before making a commitment.</span></div></div><div className="faq-list">{financeFaqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}</div></section>;
}
