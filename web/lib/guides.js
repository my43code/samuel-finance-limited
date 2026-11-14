export const guides = [
  {
    slug: "borrowing-basics",
    title: "Understand the cost of borrowing",
    summary:
      "Know the terms, compare the full repayment amount and prepare the questions that matter before making a decision.",
    eyebrow: "BORROWING BASICS",
    readTime: "4 minute read",
    sections: [
      {
        heading: "Start with the purpose and the amount",
        paragraphs: [
          "A useful first step is to write down what the money is for, how much is needed and when it is needed. The amount borrowed is called the principal. Interest and fees can increase the amount you ultimately repay.",
          "Consider the repayment alongside essential expenses, existing commitments and changes in income. An amount that is available to borrow may differ from an amount that fits comfortably within your circumstances.",
        ],
      },
      {
        heading: "Look beyond the advertised rate",
        paragraphs: [
          "Interest is a charge for borrowing money. The rate alone does not tell you the full cost: the calculation method, repayment frequency, loan term and fees also matter. A flat-rate calculation and a calculation on the remaining balance can produce different costs even when their stated rates look similar.",
          "Ask for a written repayment schedule and an explanation of all charges. Compare offers using the same borrowing amount and term, and check the total amount repayable rather than relying only on the size of each instalment.",
        ],
        items: [
          "What interest rate applies, and how is it calculated?",
          "Which application, ongoing or other fees apply?",
          "How much is each repayment, how often is it due and how many are required?",
          "What is the total amount repayable over the full term?",
          "What happens if a repayment is late or the balance is paid early?",
        ],
      },
      {
        heading: "Understand the term and any security",
        paragraphs: [
          "The loan term is the agreed time for repayment. A longer term may reduce each instalment while increasing the total interest paid. Ask to see the effect of changing the term before deciding.",
          "A secured loan is supported by an asset that the lender may have rights over if the borrower does not meet the agreement. An unsecured loan does not use a specific asset as security, but repayment obligations still apply. If a guarantor is required, everyone involved should understand that person's obligations before signing.",
        ],
      },
      {
        heading: "Read, ask and keep a copy",
        paragraphs: [
          "Read the complete agreement and ask for any unfamiliar wording to be explained. Keep copies of the offer, repayment schedule, fees and signed documents. Confirm who to contact if your circumstances change or you have a question about a repayment.",
          "For Samuel Finance, contact our team to confirm current product availability, eligibility, rates, fees and terms. This guide describes general borrowing concepts; it does not set out a Samuel Finance product or offer.",
        ],
      },
    ],
  },
  {
    slug: "preparing-an-enquiry",
    title: "Prepare for your first finance conversation",
    summary:
      "Bring a clear purpose, a realistic view of your budget and the right questions to your first enquiry.",
    eyebrow: "YOUR NEXT STEP",
    readTime: "3 minute read",
    sections: [
      {
        heading: "Be clear about what you need",
        paragraphs: [
          "Write a short description of the purpose, the amount you have in mind and your preferred timing. Include the questions you would like answered. This helps you have a focused conversation about what is available and what the next steps involve.",
          "Contact Samuel Finance through the details published on this website. Ask our team to confirm the current enquiry process, product availability and eligibility before preparing an application.",
        ],
      },
      {
        heading: "Review your income and commitments",
        paragraphs: [
          "Make a private record of your regular income and essential spending. Include existing loan repayments and other financial commitments. Think about expenses that occur less frequently as well as your day-to-day costs.",
          "Keep this information for your own preparation. You do not need to enter financial details into the website's preparation checklist. If an assessment is available, ask the team how the information will be collected and used.",
        ],
      },
      {
        heading: "Confirm the document checklist",
        paragraphs: [
          "Different applications can require different evidence. Identification, proof of income, details of existing commitments or a quotation for the intended purchase are examples of information a lender may request. They are not a confirmed Samuel Finance requirements list.",
          "Use the latest form published in Forms & resources, read its instructions and ask our team which documents apply to your enquiry. Check that information is current and complete before submitting it.",
        ],
        items: [
          "Which form should I use, and is it the current version?",
          "What evidence is required for my circumstances?",
          "How should I submit documents securely?",
          "How will I receive confirmation and follow up on my enquiry?",
        ],
      },
      {
        heading: "Protect your personal information",
        paragraphs: [
          "Before sending identification, bank statements or other sensitive information, confirm the receiving address and a suitable submission method directly with our team. Avoid placing these documents in public comments or social media messages.",
          "Never share your banking password, PIN or one-time verification code. An initial enquiry or a downloaded form is a starting point for a conversation; it does not confirm eligibility, a loan offer or approval.",
        ],
      },
    ],
  },
];

export function guideBySlug(slug) {
  return guides.find((guide) => guide.slug === slug);
}
