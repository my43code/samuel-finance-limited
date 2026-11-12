import { publicData } from "../../lib/public-data";
import { PublicShell } from "../../components/public-shell";
export const metadata = { title: "Website privacy" };
export const dynamic = "force-dynamic";
export default async function Privacy() {
  const { company } = await publicData();
  return (
    <PublicShell company={company}>
      <main className="article-page" id="main">
        <span className="eyebrow">WEBSITE INFORMATION</span>
        <h1>
          Your privacy <em>matters.</em>
        </h1>
        <div className="article-body">
          <h2>Public website</h2>
          <p>
            You can browse company information, updates, careers and application
            resources without creating an account. Our hosting provider
            processes technical request information needed to operate and
            protect the website.
          </p>
          <h2>Contact and applications</h2>
          <p>
            Email, phone and WhatsApp links open external services with their
            own privacy terms. Please confirm a secure process with the company
            before sending identity documents, bank details or other sensitive
            information. This website does not accept completed loan
            applications or personal-document uploads.
          </p>
          <h2>Administrator access</h2>
          <p>
            The administrator area uses Supabase authentication and essential
            cookies to maintain authorised sessions. Access is restricted to
            approved administrators. Administrative content changes are logged
            for accountability.
          </p>
          <h2>Files and media</h2>
          <p>
            Published company files are available through temporary download
            links. Files uploaded to the administrator library remain private
            until attached to published content. External media and fonts may
            involve requests to their service providers.
          </p>
          <h2>Questions</h2>
          <p>
            For privacy questions or requests concerning information you have
            shared with the company, contact{" "}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        </div>
      </main>
    </PublicShell>
  );
}
