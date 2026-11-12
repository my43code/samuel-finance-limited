import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin, CalendarDays } from "lucide-react";
import { publicData, publicEntry } from "../../../lib/public-data";
import { PublicShell } from "../../../components/public-shell";
import { dateLabel } from "../../../components/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await publicEntry(id, "vacancy");
  return { title: job?.title || "Vacancy not found" };
}
export default async function Job({ params }) {
  const { id } = await params;
  const job = await publicEntry(id, "vacancy");
  if (!job) notFound();
  const { company } = await publicData();
  const closed =
    job.closing_date &&
    job.closing_date < new Date().toISOString().slice(0, 10);
  return (
    <PublicShell company={company}>
      <main id="main" className="article-page">
        <a className="text-link" href="/careers">
          <ArrowLeft size={16} />
          All opportunities
        </a>
        <span className="eyebrow">
          {job.employment_type || "CAREER OPPORTUNITY"}
        </span>
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span>
            <MapPin size={16} />
            {job.location}
          </span>
          {job.closing_date && (
            <span>
              <CalendarDays size={16} />
              {closed
                ? "Applications closed"
                : "Closes " + dateLabel(job.closing_date)}
            </span>
          )}
        </div>
        <p className="article-summary">{job.summary}</p>
        <div className="article-body">
          {job.body.split(/\n\s*\n/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="job-apply">
          <h2>
            {closed ? "Applications have closed." : "Take the next step."}
          </h2>
          {!closed && (
            <>
              <p>
                Send your application as described in this vacancy. Include the
                role title in your email subject.
              </p>
              <a
                className="button forest"
                href={`mailto:${job.apply_email}?subject=${encodeURIComponent("Application: " + job.title)}`}
              >
                Apply by email <ArrowUpRight size={17} />
              </a>
            </>
          )}
        </div>
      </main>
    </PublicShell>
  );
}
