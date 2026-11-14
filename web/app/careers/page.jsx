import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
import { JobCard, PublicEmpty } from "../../components/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Careers", description: "Explore published career opportunities at Samuel Finance Limited in Papua New Guinea.", alternates: { canonical: "/careers" } };
export default async function Careers() {
  const { company, entries } = await publicData();
  const jobs = entries.filter(
    (e) =>
      e.kind === "vacancy" &&
      (!e.closing_date ||
        e.closing_date >= new Date().toISOString().slice(0, 10)),
  );
  return (
    <PublicShell company={company}>
      <main id="main">
        <section className="page-intro">
          <span className="eyebrow">GROW WITH PURPOSE</span>
          <h1>
            Good people.
            <br />
            <em>Shared ambition.</em>
          </h1>
          <p>
            Explore opportunities to contribute to a thoughtful, accountable
            approach to finance in Papua New Guinea.
          </p>
        </section>
        <section className="listing-section jobs-list">
          <div className="listing-heading">
            <h2>Current opportunities</h2>
            <span>
              {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
            </span>
          </div>
          {jobs.length ? (
            jobs.map((e) => <JobCard key={e.id} entry={e} />)
          ) : (
            <PublicEmpty title="No open vacancies at the moment.">
              New opportunities will be published here. Please check back for
              future openings.
            </PublicEmpty>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
