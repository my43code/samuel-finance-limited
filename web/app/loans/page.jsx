import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
import { DocumentCard, PublicEmpty } from "../../components/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Loan application forms & resources" };
export default async function Loans() {
  const { company, entries } = await publicData();
  const forms = entries.filter((e) => e.kind === "document" && e.media_id);
  return (
    <PublicShell company={company}>
      <main id="main">
        <section className="page-intro">
          <span className="eyebrow">FOR A MORE INFORMED NEXT STEP</span>
          <h1>
            Forms & <em>resources.</em>
          </h1>
          <p>
            Find published application documents and instructions. Speak with
            our team to confirm which form is right for your circumstances.
          </p>
        </section>
        <section className="listing-section">
          <div className="listing-heading">
            <h2>Loan application forms</h2>
            <span>PDF documents</span>
          </div>
          {forms.length ? (
            <div className="documents-list">
              {forms.map((e) => (
                <DocumentCard entry={e} key={e.id} />
              ))}
            </div>
          ) : (
            <PublicEmpty title="Application forms are not yet available.">
              Our team will publish current application documents here when they
              are available. Please contact us for information.
            </PublicEmpty>
          )}
          <div className="download-notice">
            <ShieldCheck size={26} />
            <div>
              <h3>Your information deserves care.</h3>
              <p>
                Downloading or completing a form does not guarantee eligibility
                or loan approval. Confirm the application process and a secure
                submission method with our team before sending identity
                documents, bank details or other sensitive information.
              </p>
              <a className="text-link" href={`mailto:${company.email}`}>
                Ask our team <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
