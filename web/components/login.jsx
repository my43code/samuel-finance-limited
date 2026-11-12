"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Mail,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import Brand from "./brand";
export default function Login({ configured, reset = false, expired = false }) {
  const [mode, setMode] = useState(reset ? "password" : "login");
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(
      expired
        ? "Your recovery link has expired. Request a new link below."
        : "",
    ),
    [success, setSuccess] = useState("");
  function changeMode(next) {
    setMode(next);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirm("");
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (mode === "password" && password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (mode === "login") {
        window.location.assign("/admin");
        return;
      }
      if (mode === "recover") setSuccess(data.message);
      else {
        setSuccess(
          "Your password has been updated. Sign in with your new password.",
        );
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      setError(err.message || "Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand light />
        <div className="login-mountain" />
        <div className="login-story-content">
          <span className="eyebrow">SAMUEL FINANCE / ADMINISTRATION</span>
          <h1>
            A clear vision.
            <br />A stronger
            <br />
            <em>connection.</em>
          </h1>
          <p>
            Your workspace for keeping our company informed, connected and
            moving forward.
          </p>
          <div className="login-story-line" />
          <span className="login-story-caption">
            INTEGRITY IN EVERY DETAIL.
          </span>
        </div>
        <div className="login-story-footer">
          <span>Papua New Guinea</span>
          <span>Built on trust. Focused on progress.</span>
        </div>
      </section>
      <section className="login-panel">
        <a className="login-back" href="/">
          <ArrowLeft size={16} />
          Back to the website
        </a>
        <div className="login-card">
          <span className="login-lock">
            <LockKeyhole size={24} />
          </span>
          <span className="eyebrow">AUTHORISED PERSONNEL ONLY</span>
          <h2>
            {mode === "login"
              ? "Welcome back."
              : mode === "recover"
                ? "Let’s get you back in."
                : "A fresh start."}
          </h2>
          <p className="login-description">
            {mode === "login"
              ? "Sign in to manage company information, publish updates and keep your website current."
              : mode === "recover"
                ? "Enter your administrator email. We’ll send a secure link to reset your password."
                : "Choose a strong password to secure your administrator account."}
          </p>
          {!configured && (
            <div className="notice-box">
              <ShieldCheck size={19} />
              <div>
                <strong>Administrator sign-in is being prepared.</strong>
                <p>
                  Please contact the site owner to activate your account. Public
                  website information remains available.
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="feedback error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="feedback success" role="status">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}
          <form onSubmit={submit} className="login-form">
            {mode !== "password" && (
              <label>
                Email address
                <div className="input-with-icon">
                  <Mail size={17} />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    autoComplete="username"
                    required
                    value={email}
                    maxLength={254}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy || !configured}
                  />
                </div>
              </label>
            )}
            {mode !== "recover" && (
              <>
                <label>
                  {mode === "password" ? "New password" : "Password"}
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      type={show ? "text" : "password"}
                      name="password"
                      placeholder={
                        mode === "password"
                          ? "At least 12 characters"
                          : "Enter your password"
                      }
                      minLength={mode === "password" ? 12 : 1}
                      maxLength={128}
                      autoComplete={
                        mode === "password"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={busy || !configured}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
                {mode === "password" && (
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      required
                      minLength={12}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={busy || !configured}
                    />
                  </label>
                )}
              </>
            )}
            {mode === "login" && (
              <div className="login-form-note">
                <span>
                  <ShieldCheck size={14} />
                  Protected administrator access
                </span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => changeMode("recover")}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              className="button forest login-submit"
              disabled={busy || !configured}
              type="submit"
            >
              {busy ? (
                <>
                  <LoaderCircle size={17} className="spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {mode === "login"
                    ? "Sign in to your workspace"
                    : mode === "recover"
                      ? "Send recovery link"
                      : "Update password"}
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
            {mode !== "login" && (
              <button
                className="login-return text-button"
                type="button"
                onClick={() => changeMode("login")}
              >
                <ArrowLeft size={15} />
                Return to sign-in
              </button>
            )}
          </form>
          <div className="login-assurance">
            <ShieldCheck size={20} />
            <p>
              Access is limited to approved administrators.
              <br />
              <span>Your session and content are protected.</span>
            </p>
          </div>
        </div>
        <footer className="login-panel-footer">
          <span>© {new Date().getFullYear()} Samuel Finance Limited</span>
          <a href="/privacy">Privacy & security</a>
        </footer>
      </section>
    </main>
  );
}
