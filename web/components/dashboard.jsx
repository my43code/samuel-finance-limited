"use client";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Newspaper,
  Images,
  FileText,
  BriefcaseBusiness,
  Activity,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  LogOut,
  Menu,
  X,
  Upload,
  Check,
  Eye,
  Pencil,
  Trash2,
  Download,
  ShieldCheck,
  LockKeyhole,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  File,
  Clock3,
  Globe,
  Save,
  Mail,
  CalendarDays,
  MoreHorizontal,
  CircleHelp,
  Copy,
  UserRound,
} from "lucide-react";
import Brand from "./brand";
import { companyDefaults, kinds, mediaUrl } from "../lib/defaults";
const navigation = [
  ["overview", "Overview", LayoutDashboard],
  ["company", "Company profile", Building2],
  ["leadership", "Leadership team", UserRound],
  ["update", "News & updates", Newspaper],
  ["media", "Media library", Images],
  ["document", "Loan forms", FileText],
  ["vacancy", "Job vacancies", BriefcaseBusiness],
  ["activity", "Activity log", Activity],
  ["account", "Account & security", Settings],
];
const stamp = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not yet published";
const bytes = (v) =>
  v >= 1048576 ? `${(v / 1048576).toFixed(1)} MB` : `${Math.ceil(v / 1024)} KB`;
const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
const blank = (kind) => ({
  kind,
  title: "",
  summary: "",
  body: "",
  status: "draft",
  media_id: null,
  location: "",
  employment_type: "",
  closing_date: "",
  apply_email: "",
});
const blankLeader = () => ({
  name: "",
  role: "",
  bio: "",
  media_id: null,
  status: "draft",
  sort_order: 0,
});
export async function request(url, body, method = "POST") {
  const r = await fetch(url, {
    method,
    headers:
      body instanceof FormData ? {} : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  let data;
  try {
    data = await r.json();
  } catch {
    throw Error("The server could not be reached. Please try again.");
  }
  if (!r.ok) throw Error(data.error || "This action could not be completed.");
  return data;
}
function Status({ value }) {
  return (
    <span className={`status-pill ${value}`}>
      <span />
      {value === "published"
        ? "Published"
        : value === "archived"
          ? "Archived"
          : "Draft"}
    </span>
  );
}
function Modal({ title, kicker, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`cms-dialog ${wide ? "wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow">{kicker}</span>
          <h2>{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Empty({
  icon: Icon = FileText,
  title,
  description,
  action,
  onAction,
}) {
  return (
    <div className="cms-empty">
      <span>
        <Icon size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button forest" onClick={onAction}>
          <Plus size={15} />
          {action}
        </button>
      )}
    </div>
  );
}
export default function Dashboard({ user }) {
  const [tab, setTab] = useState("overview"),
    [mobile, setMobile] = useState(false),
    [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [editor, setEditor] = useState(null),
    [leaderEditor, setLeaderEditor] = useState(null),
    [upload, setUpload] = useState(false),
    [review, setReview] = useState(false),
    [company, setCompany] = useState(companyDefaults),
    [companyRevision, setCompanyRevision] = useState(1),
    [companyDirty, setCompanyDirty] = useState(false);
  const [uploadFile, setUploadFile] = useState(null),
    [uploadName, setUploadName] = useState(""),
    [uploadAlt, setUploadAlt] = useState(""),
    [mediaFilter, setMediaFilter] = useState("all");
  async function refresh() {
    setLoading(true);
    try {
      const next = await request("/api/admin/overview", undefined, "GET");
      setData(next);
      const draft = next.company.find((c) => c.id === "draft");
      setCompany({ ...companyDefaults, ...(draft?.content || {}) });
      setCompanyRevision(draft?.revision || 1);
      setCompanyDirty(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const warn = (e) => {
      if (companyDirty || editor) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [companyDirty, editor]);
  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function navigate(next) {
    if (
      companyDirty &&
      !confirm(
        "Leave this page and discard your unsaved company profile changes?",
      )
    )
      return;
    setCompanyDirty(false);
    setTab(next);
    setQuery("");
    setFilter("all");
    setMobile(false);
    if (data) {
      const draft = data.company.find((c) => c.id === "draft");
      setCompany({ ...companyDefaults, ...(draft?.content || {}) });
    }
  }
  function openEditor(value) {
    setError("");
    setEditor({
      ...blank(value.kind),
      ...value,
      closing_date: value.closing_date || "",
    });
  }
  function closeEditor() {
    if (busy) return;
    if (confirm("Close the editor? Unsaved changes will be lost.")) {
      setEditor(null);
      setError("");
    }
  }
  function openLeaderEditor(value = blankLeader()) {
    setError("");
    setLeaderEditor({
      ...blankLeader(),
      ...value,
      bio: value.bio || "",
      media_id: value.media_id || null,
      sort_order: Number.isInteger(value.sort_order) ? value.sort_order : 0,
    });
  }
  function closeLeaderEditor() {
    if (busy) return;
    if (confirm("Close the profile editor? Unsaved changes will be lost.")) {
      setLeaderEditor(null);
      setError("");
    }
  }
  async function saveLeader(status) {
    await run(async () => {
      await request("/api/admin/leadership", {
        ...leaderEditor,
        status,
        sort_order: Number(leaderEditor.sort_order) || 0,
      });
      setLeaderEditor(null);
      await refresh();
      setToast(
        status === "published"
          ? "Leadership profile published to your website."
          : status === "archived"
            ? "Leadership profile archived."
            : "Leadership profile saved as a draft.",
      );
    });
  }
  async function removeLeader(leader) {
    if (!confirm(`Remove “${leader.name}” from the leadership team?`)) return;
    await run(async () => {
      await request(
        "/api/admin/leadership",
        { id: leader.id, revision: leader.revision },
        "DELETE",
      );
      await refresh();
      setToast("Leadership profile removed.");
    });
  }
  async function saveEntry(status) {
    if (
      editor.status === "published" &&
      status === "draft" &&
      !confirm(
        "Saving this as a draft will remove it from the public website. Continue?",
      )
    )
      return;
    await run(async () => {
      await request("/api/admin/entries", { ...editor, status });
      setEditor(null);
      await refresh();
      setToast(
        status === "published"
          ? "Published. Your website is up to date."
          : "Draft saved. This item is not visible to visitors.",
      );
    });
  }
  async function removeEntry(entry) {
    if (
      !confirm(
        `Permanently delete “${entry.title}”? This will also remove it from the public website.`,
      )
    )
      return;
    await run(async () => {
      await request(
        "/api/admin/entries",
        { id: entry.id, revision: entry.revision },
        "DELETE",
      );
      await refresh();
      setToast("Content removed.");
    });
  }
  async function saveCompany(publish) {
    await run(async () => {
      await request("/api/admin/company", {
        revision: companyRevision,
        content: company,
        publish,
      });
      setReview(false);
      await refresh();
      setToast(
        publish
          ? "Company profile published to your website."
          : "Company profile draft saved.",
      );
    });
  }
  async function uploadMedia(e) {
    e.preventDefault();
    if (!uploadFile) return;
    await run(async () => {
      const form = new FormData();
      form.set("file", uploadFile);
      form.set("name", uploadName);
      form.set("alt_text", uploadAlt);
      await request("/api/admin/media", form);
      setUpload(false);
      setUploadFile(null);
      setUploadName("");
      setUploadAlt("");
      await refresh();
      setToast("File uploaded privately. Attach it to content to publish it.");
    });
  }
  async function removeMedia(file) {
    if (
      !confirm(`Delete “${file.name}” from the library? This cannot be undone.`)
    )
      return;
    await run(async () => {
      await request("/api/admin/media", { id: file.id }, "DELETE");
      await refresh();
      setToast("File removed.");
    });
  }
  async function signOut() {
    if (companyDirty && !confirm("Sign out and discard your unsaved changes?"))
      return;
    await run(async () => {
      await request("/api/auth", { action: "logout" });
      window.location.assign("/admin/login");
    });
  }
  const entries = data?.entries || [],
    media = data?.media || [],
    leadership = data?.leadership || [],
    activity = data?.activity || [];
  const list = entries.filter(
    (e) =>
      e.kind === tab &&
      (filter === "all" || e.status === filter) &&
      `${e.title} ${e.summary}`.toLowerCase().includes(query.toLowerCase()),
  );
  const published = entries.filter((e) => e.status === "published").length,
    drafts = entries.filter((e) => e.status === "draft").length;
  const jobs = entries.filter(
    (e) =>
      e.kind === "vacancy" &&
      e.status === "published" &&
      (!e.closing_date ||
        e.closing_date >= new Date().toISOString().slice(0, 10)),
  ).length;
  const title = navigation.find((n) => n[0] === tab)?.[1] || "Overview";
  const visibleMedia = media.filter(
    (f) =>
      (mediaFilter === "all" ||
        (mediaFilter === "image"
          ? f.mime.startsWith("image/")
          : mediaFilter === "video"
            ? f.mime.startsWith("video/")
            : f.mime === "application/pdf")) &&
      `${f.name} ${f.alt_text}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="cms-app">
      <aside className={`cms-sidebar ${mobile ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Brand light small />
          <button
            className="icon-button mobile-close"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <span className="sidebar-section-label">YOUR WORKSPACE</span>
        <nav aria-label="Administration">
          {navigation.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`${tab === id ? "active" : ""} ${id === "activity" ? "nav-divider" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "update" && drafts > 0 && (
                <small>
                  {
                    entries.filter(
                      (e) => e.kind === "update" && e.status === "draft",
                    ).length
                  }
                </small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <ShieldCheck size={21} />
            <strong>Built on trust.</strong>
            <p>A secure space for your company’s next chapter.</p>
            <a href="/" target="_blank" rel="noopener noreferrer">
              View public website <ArrowUpRight size={14} />
            </a>
          </div>
          <button className="sidebar-user" onClick={() => navigate("account")}>
            <span className="avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{user.name}</strong>
              <small>
                {user.role === "owner" ? "Site owner" : "Content administrator"}
              </small>
            </span>
            <Settings size={16} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="cms-main">
        <header className="cms-topbar">
          <div>
            <button
              className="icon-button mobile-toggle"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <span className="topbar-company">Samuel Finance</span>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <div>
            <span className="workspace-status">
              <span />
              Administrator workspace
            </span>
            <a
              className="button outline compact"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View website <ArrowUpRight size={14} />
            </a>
            <button
              className="avatar"
              onClick={() => navigate("account")}
              aria-label="Your account"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="cms-content" id="main">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">
                {tab === "overview"
                  ? "YOUR COMPANY. YOUR VOICE."
                  : "SAMUEL FINANCE / CONTENT MANAGEMENT"}
              </span>
              <h1>
                {tab === "overview" ? "Your website, well managed." : title}
              </h1>
              <p>
                {
                  {
                    overview:
                      "A clear view of your content, resources and company communications.",
                    company:
                      "Keep your company story and contact details accurate and current.",
                    leadership:
                      "Manage the names, roles, biographies and profile photos shown on your public website.",
                    update:
                      "Share company announcements, perspectives and developments.",
                    media:
                      "Your images, profile photos, short videos and documents, organised in one place.",
                    document:
                      "Manage the PDF forms and application instructions available to visitors.",
                    vacancy:
                      "Publish opportunities and connect with your next team member.",
                    activity:
                      "An accountable record of changes made to your website.",
                    account:
                      "Your administrator identity and workspace security.",
                  }[tab]
                }
              </p>
            </div>
            <div className="heading-actions">
              {tab === "overview" ? (
                <button
                  className="button forest"
                  disabled={!data || busy}
                  onClick={() => openEditor(blank("update"))}
                >
                  <Plus size={17} />
                  Create an update
                </button>
              ) : ["update", "document", "vacancy"].includes(tab) ? (
                <button
                  className="button forest"
                  disabled={!data || busy}
                  onClick={() => openEditor(blank(tab))}
                >
                  <Plus size={17} />
                  {tab === "update"
                    ? "New update"
                    : tab === "vacancy"
                      ? "New vacancy"
                      : "Add loan form"}
                </button>
              ) : tab === "media" ? (
                <button
                  className="button forest"
                  disabled={!data || busy}
                  onClick={() => {
                    setError("");
                    setUpload(true);
                  }}
                >
                  <Upload size={16} />
                  Upload files
                </button>
              ) : tab === "leadership" ? (
                <button
                  className="button forest"
                  disabled={!data || busy}
                  onClick={() => openLeaderEditor()}
                >
                  <Plus size={17} />
                  Add profile
                </button>
              ) : null}
            </div>
          </div>
          {error && !editor && !upload && !review && (
            <div className="feedback error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                className="text-button"
                onClick={() => {
                  setError("");
                  refresh();
                }}
              >
                Retry
              </button>
            </div>
          )}
          {loading && !data ? (
            <div className="dashboard-loading" role="status">
              <LoaderCircle className="spin" size={25} />
              <h2>Preparing your workspace</h2>
              <p>Loading your company content securely.</p>
            </div>
          ) : !data ? (
            <Empty
              icon={AlertCircle}
              title="Your workspace could not be loaded."
              description="Check the connection and try again. Your existing content has not been changed."
              action="Try again"
              onAction={refresh}
            />
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="stats-grid">
                    {[
                      [
                        "Published content",
                        published,
                        Globe,
                        "Live on your website",
                        "forest",
                      ],
                      [
                        "Work in progress",
                        drafts,
                        FileText,
                        "Drafts awaiting publication",
                        "gold",
                      ],
                      [
                        "Media library",
                        media.length,
                        Images,
                        "Files ready for your content",
                        "blue",
                      ],
                      [
                        "Open vacancies",
                        jobs,
                        BriefcaseBusiness,
                        "Opportunities accepting applications",
                        "rose",
                      ],
                    ].map(([label, value, Icon, hint, tone]) => (
                      <section className="stat-panel" key={label}>
                        <div>
                          <span>{label}</span>
                          <span className={`stat-icon ${tone}`}>
                            <Icon size={19} />
                          </span>
                        </div>
                        <strong>{value.toString().padStart(2, "0")}</strong>
                        <p>{hint}</p>
                      </section>
                    ))}
                  </div>
                  <div className="overview-grid">
                    <section className="cms-card recent-card">
                      <div className="card-top">
                        <div>
                          <h2>Recent content</h2>
                          <p>The latest additions to your website.</p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => navigate("update")}
                        >
                          Manage content <ArrowUpRight size={15} />
                        </button>
                      </div>
                      {entries.length ? (
                        <ContentTable
                          rows={entries.slice(0, 6)}
                          onEdit={openEditor}
                          onDelete={removeEntry}
                          busy={busy}
                        />
                      ) : (
                        <Empty
                          icon={Newspaper}
                          title="Your next update starts here."
                          description="Create your first announcement and share what’s happening at Samuel Finance."
                          action="Create an update"
                          onAction={() => openEditor(blank("update"))}
                        />
                      )}
                    </section>
                    <aside className="overview-side">
                      <div className="website-preview">
                        <img
                          src="/assets/mountains.jpg"
                          alt="Mountain summit"
                        />
                        <div>
                          <span className="eyebrow">YOUR PUBLIC WEBSITE</span>
                          <h3>
                            A foundation
                            <br />
                            for <em>progress.</em>
                          </h3>
                          <a
                            className="button white"
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit website <ArrowUpRight size={16} />
                          </a>
                        </div>
                      </div>
                      <div className="cms-card quick-start">
                        <span className="eyebrow">MAKE IT HAPPEN</span>
                        <h3>A place for every update.</h3>
                        {[
                          ["company", "Update company profile", Building2],
                          ["media", "Add photos or a video", Images],
                          ["document", "Upload an application form", FileText],
                          [
                            "vacancy",
                            "Create a job vacancy",
                            BriefcaseBusiness,
                          ],
                        ].map(([id, label, Icon]) => (
                          <button key={id} onClick={() => navigate(id)}>
                            <Icon size={17} />
                            <span>{label}</span>
                            <ChevronRight size={15} />
                          </button>
                        ))}
                      </div>
                    </aside>
                  </div>
                  <section className="cms-card overview-activity">
                    <div className="card-top">
                      <div>
                        <h2>Recent activity</h2>
                        <p>Every change, accounted for.</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => navigate("activity")}
                      >
                        View activity <ArrowUpRight size={15} />
                      </button>
                    </div>
                    <ActivityList items={activity.slice(0, 4)} />
                  </section>
                </>
              )}
              {tab === "leadership" && (
                <section className="cms-card leadership-manager">
                  <div className="card-top">
                    <div>
                      <h2>People behind the purpose.</h2>
                      <p>
                        Every name, role and profile image on the public site is
                        managed here and stored in Supabase.
                      </p>
                    </div>
                    <span className="editor-state">
                      {
                        leadership.filter(
                          (leader) => leader.status === "published",
                        ).length
                      }{" "}
                      published
                    </span>
                  </div>
                  {leadership.length ? (
                    <div className="leadership-admin-grid">
                      {leadership.map((leader) => (
                        <article
                          className="leadership-admin-card"
                          key={leader.id}
                        >
                          <div className="leadership-admin-photo">
                            {leader.media?.mime?.startsWith("image/") ? (
                              <img
                                src={mediaUrl(leader.media_id)}
                                alt={leader.media.alt_text || leader.name}
                              />
                            ) : (
                              <span>{initials(leader.name)}</span>
                            )}
                          </div>
                          <div className="leadership-admin-copy">
                            <Status value={leader.status} />
                            <h3>{leader.name}</h3>
                            <strong>{leader.role}</strong>
                            {leader.bio && <p>{leader.bio}</p>}
                            <div className="leadership-admin-actions">
                              <button
                                className="text-button"
                                disabled={busy}
                                onClick={() => openLeaderEditor(leader)}
                              >
                                <Pencil size={14} /> Edit
                              </button>
                              <button
                                className="icon-button danger-hover"
                                disabled={busy}
                                aria-label={`Delete ${leader.name}`}
                                onClick={() => removeLeader(leader)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      icon={UserRound}
                      title="Build your leadership page."
                      description="Add a profile and publish it when the name, role and photo are ready."
                      action="Add a profile"
                      onAction={() => openLeaderEditor()}
                    />
                  )}
                  <div className="notice-box leadership-notice">
                    <LockKeyhole size={18} />
                    <p>
                      Profile photos are private until the corresponding
                      leadership profile is published. Upload a portrait in the
                      media library, then select it here.
                    </p>
                  </div>
                </section>
              )}
              {["update", "document", "vacancy"].includes(tab) && (
                <section className="cms-card">
                  <div className="content-toolbar">
                    <div className="filter-tabs">
                      {["all", "published", "draft", "archived"].map((s) => (
                        <button
                          key={s}
                          className={filter === s ? "active" : ""}
                          onClick={() => setFilter(s)}
                        >
                          {s === "all"
                            ? "All content"
                            : s[0].toUpperCase() + s.slice(1)}{" "}
                          <span>
                            {
                              entries.filter(
                                (e) =>
                                  e.kind === tab &&
                                  (s === "all" || e.status === s),
                              ).length
                            }
                          </span>
                        </button>
                      ))}
                    </div>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        aria-label="Search content"
                        placeholder="Search content…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  {list.length ? (
                    <ContentTable
                      rows={list}
                      onEdit={openEditor}
                      onDelete={removeEntry}
                      busy={busy}
                    />
                  ) : (
                    <Empty
                      icon={
                        tab === "vacancy"
                          ? BriefcaseBusiness
                          : tab === "document"
                            ? FileText
                            : Newspaper
                      }
                      title={
                        query || filter !== "all"
                          ? "No matching content."
                          : tab === "vacancy"
                            ? "Your next opportunity starts here."
                            : tab === "document"
                              ? "Make the next step easier."
                              : "A story worth sharing."
                      }
                      description={
                        query || filter !== "all"
                          ? "Try another search or content filter."
                          : tab === "document"
                            ? "Upload a PDF to the media library, then add a form with a clear title and instructions."
                            : "Create content, save a draft and publish when you’re ready."
                      }
                      action={
                        !query && filter === "all"
                          ? "Create " +
                            (tab === "vacancy"
                              ? "a vacancy"
                              : tab === "document"
                                ? "a loan form"
                                : "an update")
                          : null
                      }
                      onAction={() => openEditor(blank(tab))}
                    />
                  )}
                </section>
              )}
              {tab === "media" && (
                <>
                  <div className="media-toolbar">
                    <div className="filter-tabs">
                      {[
                        ["all", "All files"],
                        ["image", "Images"],
                        ["video", "Videos"],
                        ["pdf", "PDF documents"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          className={mediaFilter === id ? "active" : ""}
                          onClick={() => setMediaFilter(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        aria-label="Search media"
                        placeholder="Search your library…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="notice-box media-privacy">
                    <LockKeyhole size={18} />
                    <p>
                      Files stay private until you attach them to published
                      content. Upload images up to 10 MB, PDFs up to 15 MB, and
                      short videos up to 50 MB.
                    </p>
                  </div>
                  {visibleMedia.length ? (
                    <div className="media-grid">
                      {visibleMedia.map((file) => (
                        <article className="media-card" key={file.id}>
                          <div className="media-preview">
                            {file.mime.startsWith("image/") ? (
                              <img
                                src={mediaUrl(file.id)}
                                alt={file.alt_text}
                                loading="lazy"
                              />
                            ) : file.mime.startsWith("video/") ? (
                              <video
                                src={mediaUrl(file.id)}
                                controls
                                preload="metadata"
                                aria-label={file.alt_text}
                              />
                            ) : (
                              <div className="pdf-preview">
                                <FileText size={44} />
                                <span>PDF DOCUMENT</span>
                              </div>
                            )}
                            <span className="media-type">
                              {file.mime.startsWith("image/")
                                ? "IMAGE"
                                : file.mime.startsWith("video/")
                                  ? "VIDEO"
                                  : "PDF"}
                            </span>
                          </div>
                          <div className="media-details">
                            <h3>{file.name}</h3>
                            <p>
                              {bytes(file.size)} <span>·</span>{" "}
                              {stamp(file.created_at)}
                            </p>
                            <div>
                              <a
                                href={mediaUrl(file.id)}
                                className="text-button"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Preview <ArrowUpRight size={14} />
                              </a>
                              <button
                                className="icon-button"
                                disabled={busy}
                                aria-label={`Delete ${file.name}`}
                                onClick={() => removeMedia(file)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="cms-card">
                      <Empty
                        icon={Images}
                        title={
                          query
                            ? "No matching files."
                            : "Your company, in focus."
                        }
                        description="Upload photos, short videos or PDF forms. Your library keeps everything ready for the right moment."
                        action="Upload a file"
                        onAction={() => setUpload(true)}
                      />
                    </div>
                  )}
                  <section className="cms-card gallery-publishing">
                    <div>
                      <h3>Share a moment on your website.</h3>
                      <p>
                        Publish an image or short video to the homepage gallery
                        with its own title and caption.
                      </p>
                    </div>
                    <button
                      className="button outline"
                      onClick={() => openEditor(blank("media"))}
                    >
                      <Plus size={16} />
                      New gallery post
                    </button>
                  </section>
                  <section className="cms-card">
                    <div className="card-top">
                      <div>
                        <h2>Gallery posts</h2>
                        <p>
                          Only published posts are visible on your homepage.
                        </p>
                      </div>
                    </div>
                    {entries.some((e) => e.kind === "media") ? (
                      <ContentTable
                        rows={entries.filter((e) => e.kind === "media")}
                        onEdit={openEditor}
                        onDelete={removeEntry}
                        busy={busy}
                      />
                    ) : (
                      <p className="card-empty-line">
                        No gallery posts yet. Create one using a file from your
                        library.
                      </p>
                    )}
                  </section>
                </>
              )}
              {tab === "company" && (
                <div className="company-editor-grid">
                  <section className="cms-card profile-editor">
                    <div className="card-top">
                      <div>
                        <h2>Your company story</h2>
                        <p>
                          Save your work as a draft, then review and publish.
                        </p>
                      </div>
                      <span className="editor-state">
                        {companyDirty ? "Unsaved changes" : "Saved draft"}
                      </span>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setReview(true);
                      }}
                    >
                      <div className="form-section">
                        <h3>
                          <Building2 size={18} />
                          Company information
                        </h3>
                        {[
                          ["name", "Company name", "input"],
                          ["tagline", "Company headline", "input"],
                          ["introduction", "Website introduction", "textarea"],
                          ["about", "About the company", "textarea"],
                          ["mission", "Our purpose", "textarea"],
                        ].map(([key, label, type]) => (
                          <Field
                            key={key}
                            label={label}
                            type={type}
                            value={company[key]}
                            onChange={(v) => {
                              setCompany({ ...company, [key]: v });
                              setCompanyDirty(true);
                            }}
                            required
                            maxLength={
                              key === "about"
                                ? 3000
                                : key === "introduction" || key === "mission"
                                  ? 700
                                  : 160
                            }
                          />
                        ))}
                      </div>
                      <div className="form-section">
                        <h3>
                          <Mail size={18} />
                          Contact & location
                        </h3>
                        <div className="form-two">
                          {[
                            ["email", "Contact email", "email"],
                            ["phone", "Phone number", "tel"],
                            ["whatsapp", "WhatsApp number", "tel"],
                            ["address", "Office / location", "text"],
                          ].map(([key, label, type]) => (
                            <Field
                              key={key}
                              label={label}
                              type={type}
                              value={company[key]}
                              onChange={(v) => {
                                setCompany({ ...company, [key]: v });
                                setCompanyDirty(true);
                              }}
                              required={key !== "whatsapp"}
                              maxLength={key === "address" ? 500 : 254}
                            />
                          ))}
                        </div>
                        <Field
                          label="Contact hours / availability"
                          value={company.hours}
                          onChange={(v) => {
                            setCompany({ ...company, hours: v });
                            setCompanyDirty(true);
                          }}
                          required
                          maxLength={300}
                        />
                      </div>
                      <div className="profile-actions">
                        <button
                          className="button outline"
                          type="button"
                          disabled={busy}
                          onClick={() => saveCompany(false)}
                        >
                          <Save size={16} />
                          Save draft
                        </button>
                        <button
                          className="button forest"
                          type="submit"
                          disabled={busy}
                        >
                          <Eye size={16} />
                          Review & publish
                        </button>
                      </div>
                    </form>
                  </section>
                  <aside>
                    <section className="cms-card publishing-guide">
                      <ShieldCheck size={27} />
                      <h3>Clear information builds trust.</h3>
                      <p>
                        Keep company details factual, contact information
                        current and your message easy to understand.
                      </p>
                      <ol>
                        <li>
                          <span>01</span>
                          <div>
                            <strong>Edit with care</strong>
                            <p>Update the fields in your company profile.</p>
                          </div>
                        </li>
                        <li>
                          <span>02</span>
                          <div>
                            <strong>Save your draft</strong>
                            <p>Your draft remains private until published.</p>
                          </div>
                        </li>
                        <li>
                          <span>03</span>
                          <div>
                            <strong>Review, then publish</strong>
                            <p>
                              Changes appear on the public website immediately.
                            </p>
                          </div>
                        </li>
                      </ol>
                      <a
                        className="text-link"
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View current website <ArrowUpRight size={15} />
                      </a>
                    </section>
                    <section className="cms-card last-published">
                      <span className="eyebrow">LAST PROFILE PUBLICATION</span>
                      <strong>
                        {stamp(
                          data.company.find((c) => c.id === "published")
                            ?.updated_at,
                        )}
                      </strong>
                      <p>
                        Company information is separate from your news and media
                        posts.
                      </p>
                    </section>
                  </aside>
                </div>
              )}
              {tab === "activity" && (
                <section className="cms-card">
                  <div className="card-top">
                    <div>
                      <h2>Workspace activity</h2>
                      <p>The latest 60 changes to company content and files.</p>
                    </div>
                    <button
                      className="icon-button"
                      disabled={loading}
                      onClick={refresh}
                      aria-label="Refresh activity"
                    >
                      <RefreshCw size={18} className={loading ? "spin" : ""} />
                    </button>
                  </div>
                  <ActivityList items={activity} />
                </section>
              )}
              {tab === "account" && (
                <div className="account-grid">
                  <section className="cms-card account-card">
                    <span className="account-avatar">
                      {user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <span className="role-label">
                      {user.role === "owner"
                        ? "Site owner"
                        : "Content administrator"}
                    </span>
                    <div className="account-facts">
                      <div>
                        <span>Authentication</span>
                        <strong>Supabase secure sign-in</strong>
                      </div>
                      <div>
                        <span>Permissions</span>
                        <strong>Create, edit & publish content</strong>
                      </div>
                      <div>
                        <span>Session</span>
                        <strong>
                          <span className="tiny-dot" />
                          Authenticated
                        </strong>
                      </div>
                    </div>
                    <button
                      className="button outline"
                      disabled={busy}
                      onClick={signOut}
                    >
                      <LogOut size={16} />
                      Sign out of workspace
                    </button>
                  </section>
                  <section className="cms-card security-card">
                    <ShieldCheck size={29} />
                    <h2>Accountable by design.</h2>
                    <p>
                      Administrator access is checked on the server and enforced
                      by database permissions. Drafts and unpublished files stay
                      private.
                    </p>
                    <div className="security-row">
                      <LockKeyhole size={19} />
                      <div>
                        <strong>Approved accounts only</strong>
                        <p>
                          New administrator access is granted by the project
                          owner.
                        </p>
                      </div>
                    </div>
                    <div className="security-row">
                      <Activity size={19} />
                      <div>
                        <strong>A record of every change</strong>
                        <p>
                          Content changes are recorded in your activity log.
                        </p>
                      </div>
                    </div>
                    <div className="security-row">
                      <ShieldCheck size={19} />
                      <div>
                        <strong>A password that protects you</strong>
                        <p>
                          Use a unique password with at least 12 characters.
                          Recovery links are sent to your account email.
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const result = await request("/api/auth", {
                            action: "recover",
                            email: user.email,
                          });
                          setToast(result.message);
                        })
                      }
                    >
                      Send a password reset email <ArrowRight size={15} />
                    </button>
                  </section>
                </div>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>
              Samuel Finance Limited <span>/</span> Administration
            </span>
            <span>
              <ShieldCheck size={13} />
              Thoughtful communication. Accountable service.
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="cms-toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {editor && (
        <Modal
          title={
            editor.id
              ? "Edit " + kinds[editor.kind].toLowerCase()
              : "Create " + kinds[editor.kind].toLowerCase()
          }
          kicker="YOUR COMPANY / YOUR VOICE"
          onClose={closeEditor}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEntry("published");
            }}
          >
            <div className="dialog-body">
              {error && (
                <div className="feedback error" role="alert">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}
              <div className="editor-status">
                <Status value={editor.status} />
                <span>
                  {editor.id
                    ? "Last updated " + stamp(editor.updated_at)
                    : "New content · not yet saved"}
                </span>
              </div>
              <Field
                label={editor.kind === "vacancy" ? "Job title" : "Title"}
                required
                value={editor.title}
                maxLength={160}
                placeholder={
                  editor.kind === "update"
                    ? "A clear, meaningful headline"
                    : editor.kind === "vacancy"
                      ? "e.g. Accounts Officer"
                      : editor.kind === "document"
                        ? "e.g. Personal loan application form"
                        : "A moment worth sharing"
                }
                onChange={(v) => setEditor({ ...editor, title: v })}
              />
              <Field
                label={
                  editor.kind === "media" ? "Caption" : "Short description"
                }
                type="textarea"
                value={editor.summary}
                maxLength={600}
                rows={3}
                hint="A brief introduction visitors can scan at a glance."
                onChange={(v) => setEditor({ ...editor, summary: v })}
              />
              {editor.kind !== "media" && (
                <Field
                  label={
                    editor.kind === "vacancy"
                      ? "Job description & application instructions"
                      : editor.kind === "document"
                        ? "Form instructions"
                        : "Full update"
                  }
                  type="textarea"
                  rows={8}
                  maxLength={16000}
                  value={editor.body}
                  onChange={(v) => setEditor({ ...editor, body: v })}
                  hint="Use plain text. Separate paragraphs with a blank line."
                />
              )}
              {editor.kind === "vacancy" ? (
                <div className="form-two">
                  <Field
                    label="Location"
                    value={editor.location}
                    required
                    onChange={(v) => setEditor({ ...editor, location: v })}
                    maxLength={120}
                  />
                  <label className="form-field">
                    Employment type
                    <select
                      value={editor.employment_type}
                      onChange={(e) =>
                        setEditor({
                          ...editor,
                          employment_type: e.target.value,
                        })
                      }
                    >
                      <option value="">Choose a type</option>
                      {["Full-time", "Part-time", "Contract", "Internship"].map(
                        (t) => (
                          <option key={t}>{t}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <Field
                    label="Closing date"
                    type="date"
                    value={editor.closing_date}
                    onChange={(v) => setEditor({ ...editor, closing_date: v })}
                  />
                  <Field
                    label="Application email"
                    type="email"
                    required
                    value={editor.apply_email}
                    onChange={(v) => setEditor({ ...editor, apply_email: v })}
                  />
                </div>
              ) : (
                <label className="form-field">
                  {editor.kind === "document"
                    ? "PDF application form"
                    : "Image or short video"}
                  <select
                    value={editor.media_id || ""}
                    onChange={(e) =>
                      setEditor({ ...editor, media_id: e.target.value || null })
                    }
                  >
                    <option value="">
                      {editor.kind === "update"
                        ? "No attachment"
                        : "Choose a file from the library"}
                    </option>
                    {media
                      .filter((f) =>
                        editor.kind === "document"
                          ? f.mime === "application/pdf"
                          : /^(image|video)\//.test(f.mime),
                      )
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} · {bytes(f.size)}
                        </option>
                      ))}
                  </select>
                  <small>
                    Upload files in the media library before attaching them
                    here.
                  </small>
                  {editor.media_id && (
                    <a
                      className="text-link attachment-preview"
                      href={mediaUrl(editor.media_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Preview selected file <ArrowUpRight size={14} />
                    </a>
                  )}
                </label>
              )}
              {editor.status === "published" && (
                <div className="notice-box">
                  <Globe size={17} />
                  <p>
                    This item is currently public. Saving as a draft will remove
                    it from the website.
                  </p>
                </div>
              )}
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={closeEditor}
              >
                Cancel
              </button>
              <div>
                {editor.id && (
                  <button
                    type="button"
                    className="button outline"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await request("/api/admin/entries", {
                          ...editor,
                          status: "archived",
                        });
                        setEditor(null);
                        await refresh();
                        setToast("Content archived.");
                      })
                    }
                  >
                    Archive
                  </button>
                )}
                <button
                  type="button"
                  className="button outline"
                  disabled={busy}
                  onClick={() => saveEntry("draft")}
                >
                  <Save size={15} />
                  Save draft
                </button>
                <button type="submit" className="button forest" disabled={busy}>
                  {busy ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Publish{editor.status === "published" ? " changes" : ""}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
      {leaderEditor && (
        <Modal
          title={
            leaderEditor.id
              ? "Edit leadership profile."
              : "Add a leadership profile."
          }
          kicker="LEADERSHIP / PROFILE"
          wide
          onClose={closeLeaderEditor}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveLeader("published");
            }}
          >
            <div className="dialog-body leadership-editor">
              {error && (
                <div className="feedback error" role="alert">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}
              <div className="form-two">
                <Field
                  label="Full name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={leaderEditor.name}
                  onChange={(value) =>
                    setLeaderEditor({ ...leaderEditor, name: value })
                  }
                />
                <Field
                  label="Role / title"
                  required
                  minLength={2}
                  maxLength={120}
                  value={leaderEditor.role}
                  onChange={(value) =>
                    setLeaderEditor({ ...leaderEditor, role: value })
                  }
                />
              </div>
              <div className="form-two">
                <label className="form-field">
                  Profile photo
                  <select
                    value={leaderEditor.media_id || ""}
                    onChange={(e) =>
                      setLeaderEditor({
                        ...leaderEditor,
                        media_id: e.target.value || null,
                      })
                    }
                  >
                    <option value="">No photo — use initials</option>
                    {media
                      .filter((file) => file.mime.startsWith("image/"))
                      .map((file) => (
                        <option value={file.id} key={file.id}>
                          {file.name}
                        </option>
                      ))}
                  </select>
                  <small>
                    Upload a portrait in Media library first. Images are kept
                    private until this profile is published.
                  </small>
                </label>
                <Field
                  label="Display order"
                  type="number"
                  min={0}
                  max={999}
                  value={leaderEditor.sort_order}
                  onChange={(value) =>
                    setLeaderEditor({ ...leaderEditor, sort_order: value })
                  }
                />
              </div>
              {leaderEditor.media_id && (
                <div className="leadership-photo-preview">
                  <img
                    src={mediaUrl(leaderEditor.media_id)}
                    alt="Selected leadership profile preview"
                  />
                  <span>Selected profile photo</span>
                </div>
              )}
              <Field
                label="Biography"
                type="textarea"
                maxLength={1200}
                value={leaderEditor.bio}
                onChange={(value) =>
                  setLeaderEditor({ ...leaderEditor, bio: value })
                }
                hint="Keep this concise and factual. It appears below the role on the public website."
              />
            </div>
            <div className="dialog-actions">
              {leaderEditor.id && leaderEditor.status !== "archived" && (
                <button
                  type="button"
                  className="text-button danger-text"
                  disabled={busy}
                  onClick={() => saveLeader("archived")}
                >
                  Archive profile
                </button>
              )}
              <span />
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => saveLeader("draft")}
              >
                Save draft
              </button>
              <button type="submit" className="button forest" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Check size={16} />
                )}
                Publish profile
              </button>
            </div>
          </form>
        </Modal>
      )}
      {upload && (
        <Modal
          title="Add to your library."
          kicker="MEDIA / FILE UPLOAD"
          onClose={() => {
            if (!busy) {
              setUpload(false);
              setError("");
            }
          }}
        >
          <form onSubmit={uploadMedia}>
            <div className="dialog-body">
              {error && (
                <div className="feedback error" role="alert">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}
              <label className="file-drop">
                <Upload size={30} />
                <strong>
                  {uploadFile ? uploadFile.name : "Choose a file to upload"}
                </strong>
                <span>
                  {uploadFile
                    ? bytes(uploadFile.size)
                    : "JPEG, PNG, WebP, MP4, WebM or PDF"}
                </span>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setUploadFile(f || null);
                    if (f && !uploadName)
                      setUploadName(
                        f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
                      );
                  }}
                />
              </label>
              <Field
                label="File title"
                required
                minLength={3}
                maxLength={160}
                value={uploadName}
                onChange={setUploadName}
              />
              <Field
                label="Description / alternative text"
                type="textarea"
                required
                minLength={3}
                maxLength={300}
                value={uploadAlt}
                onChange={setUploadAlt}
                hint="Describe the image, video or document. This helps visitors who use assistive technology."
              />
              <div className="notice-box">
                <LockKeyhole size={18} />
                <p>
                  Your file stays private until it is attached to a published
                  update, gallery post, loan form or leadership profile. Images:
                  10 MB. PDFs: 15 MB. Videos: 50 MB.
                </p>
              </div>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => setUpload(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button forest"
                disabled={busy || !uploadFile}
              >
                {busy ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Upload size={17} />
                )}{" "}
                {busy ? "Uploading…" : "Upload to library"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {review && (
        <Modal
          title="Ready for the next chapter?"
          kicker="COMPANY PROFILE / PUBLISHING REVIEW"
          onClose={() => {
            if (!busy) setReview(false);
          }}
        >
          <div className="dialog-body">
            {error && (
              <div className="feedback error" role="alert">
                {error}
              </div>
            )}
            <p className="review-intro">
              These company details will appear on your public website.
            </p>
            <div className="review-fields">
              {Object.entries(company).map(([key, value]) => (
                <div key={key}>
                  <strong>
                    {
                      {
                        name: "Company name",
                        tagline: "Headline",
                        introduction: "Introduction",
                        about: "About",
                        mission: "Purpose",
                        email: "Email",
                        phone: "Phone",
                        whatsapp: "WhatsApp",
                        address: "Location",
                        hours: "Contact hours",
                      }[key]
                    }
                  </strong>
                  <p>{value || "Not provided"}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="dialog-actions">
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setReview(false)}
            >
              Keep editing
            </button>
            <button
              className="button forest"
              disabled={busy}
              onClick={() => saveCompany(true)}
            >
              {busy ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Check size={16} />
              )}
              Publish company profile
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Field({ label, type = "text", value, onChange, hint, ...props }) {
  return (
    <label className="form-field">
      {label}
      {type === "textarea" ? (
        <textarea
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          {...props}
          type={type === "input" ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}{" "}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function ContentTable({ rows, onEdit, onDelete, busy }) {
  return (
    <div className="table-scroll">
      <table className="content-table">
        <thead>
          <tr>
            <th>CONTENT</th>
            <th>STATUS</th>
            <th>LAST UPDATED</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const Icon =
              e.kind === "vacancy"
                ? BriefcaseBusiness
                : e.kind === "document"
                  ? FileText
                  : e.kind === "media"
                    ? ImageIcon
                    : Newspaper;
            return (
              <tr key={e.id}>
                <td>
                  <button className="content-title" onClick={() => onEdit(e)}>
                    <span className={`content-icon ${e.kind}`}>
                      <Icon size={19} />
                    </span>
                    <span>
                      <strong>{e.title}</strong>
                      <small>{kinds[e.kind]}</small>
                    </span>
                  </button>
                </td>
                <td>
                  <Status value={e.status} />
                </td>
                <td className="date-cell">{stamp(e.updated_at)}</td>
                <td>
                  <div className="row-actions">
                    {e.status === "published" && (
                      <a
                        className="icon-button"
                        href={
                          e.kind === "update"
                            ? `/updates/${e.id}`
                            : e.kind === "vacancy"
                              ? `/careers/${e.id}`
                              : e.kind === "document"
                                ? "/loans"
                                : "/"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${e.title}`}
                      >
                        <Eye size={16} />
                      </a>
                    )}
                    <button
                      className="icon-button"
                      disabled={busy}
                      aria-label={`Edit ${e.title}`}
                      onClick={() => onEdit(e)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button danger-hover"
                      disabled={busy}
                      aria-label={`Delete ${e.title}`}
                      onClick={() => onDelete(e)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function ActivityList({ items }) {
  return items.length ? (
    <div className="activity-list">
      {items.map((a) => (
        <div key={a.id}>
          <span className="activity-dot">
            <Activity size={15} />
          </span>
          <div>
            <strong>{a.title}</strong>
            <p>
              {a.action === "insert"
                ? "Created"
                : a.action === "delete"
                  ? "Deleted"
                  : "Updated"}{" "}
              in {a.target.replace("cms_", "").replaceAll("_", " ")}
              <span> · </span>
              {stamp(a.created_at)}
            </p>
          </div>
          <span className="activity-time">
            {new Date(a.created_at).toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="activity-empty">
      <Clock3 size={20} />
      <p>Changes to company content and files will appear here.</p>
    </div>
  );
}
