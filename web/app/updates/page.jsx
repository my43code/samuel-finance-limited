import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
import { UpdateCard, PublicEmpty } from "../../components/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "News & updates" };
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
        </section>
        <section className="listing-section">
          {posts.length ? (
            <div className="updates-grid">
              {posts.map((e) => (
                <UpdateCard key={e.id} entry={e} />
              ))}
            </div>
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
