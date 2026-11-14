import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
import { PublicEmpty } from "../../components/content";
import PublicListing from "../../components/public-listing";
import ShareButton from "../../components/share-button";
export const dynamic = "force-dynamic";
export const metadata = { title: "News & updates", description: "Company announcements, developments and perspectives from Samuel Finance Limited.", alternates: { canonical: "/updates" }, openGraph: { title: "News & updates | Samuel Finance Limited", description: "The latest company news and perspectives from Samuel Finance Limited.", url: "/updates", type: "website", images: ["/assets/mountains.jpg"] } };
export default async function Updates() {
  const { company, entries } = await publicData();
  const posts = entries.filter((e) => e.kind === "update");
  return (
    <PublicShell company={company}>
      <main id="main">
        <section className="page-intro">
          <span className="eyebrow">FROM SAMUEL FINANCE</span>
          <h1>
            News & <em>perspectives.</em>
          </h1>
          <p>
            Company announcements, developments and the ideas shaping our
            approach.
          </p>
          <div className="page-intro-actions"><ShareButton title="Samuel Finance news & updates" path="/updates" label="Share news & updates" /><a href="/loans">Explore forms & resources ↗</a></div>
        </section>
        <section className="listing-section">
          {posts.length ? (
            <PublicListing entries={posts} kind="update" />
          ) : (
            <PublicEmpty title="Updates are on their way.">
              Published announcements will appear here. For current company
              information, please contact our team.
            </PublicEmpty>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
