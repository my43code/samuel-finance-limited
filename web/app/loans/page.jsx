import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
import { PublicEmpty } from "../../components/content";
import PublicListing from "../../components/public-listing";
import ShareButton from "../../components/share-button";
export const dynamic = "force-dynamic";
export const metadata = { title: "Forms & resources", description: "Published application forms, documents and guidance from Samuel Finance Limited.", alternates: { canonical: "/loans" }, openGraph: { title: "Forms & resources | Samuel Finance Limited", description: "Find and share published forms, documents and guidance.", url: "/loans", type: "website", images: ["/assets/mountains.jpg"] } };
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
          <div className="page-intro-actions"><ShareButton title="Samuel Finance forms & resources" path="/loans" label="Share forms & resources" /><a href="/#contact">Questions? Contact our team ↗</a></div>
        </section>
        <section className="listing-section">
          <div className="listing-heading">
            <h2>Loan application forms</h2>
            <span>PDF documents</span>
          </div>
          {forms.length ? (
            <PublicListing entries={forms} kind="document" />
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
