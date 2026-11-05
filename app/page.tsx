"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const TIMELINES = [
  ["now", "This month"],
  ["soon", "In 1-3 months"],
  ["exploring", "Just exploring"],
];
const BUDGETS = [
  ["", "Prefer not to say"],
  ["unsure", "Not sure yet"],
  ["small", "Under 1,000"],
  ["medium", "1,000 to 10,000"],
  ["large", "Over 10,000"],
];

const field: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: 8,
  fontSize: 16,
  background: "#fafafa",
  color: "#111",
  boxSizing: "border-box",
};
const label: React.CSSProperties = { display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6 };
const card: React.CSSProperties = { background: "#fff", color: "#111", padding: 28, borderRadius: 12, border: "1px solid #e4e4e7" };

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("lead_token");
      if (t) setSavedToken(t);
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      timeline: String(fd.get("timeline") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      const t = data.token ? String(data.token) : "";
      setToken(t);
      setFirstName(body.name.trim().split(" ")[0]);
      if (t) {
        try {
          localStorage.setItem("lead_token", t);
        } catch {}
        setSavedToken(t);
      }
      setStatus("done");
    } catch {
      setError("Network problem. Please try again.");
      setStatus("error");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/status/" + token);
      setCopied(true);
    } catch {}
  }

  if (status === "done") {
    return (
      <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
        <div style={card}>
          <h1 style={{ marginTop: 0 }}>Thanks, {firstName}!</h1>
          <p>We got your request and will get back to you soon.</p>
          {token && (
            <div style={{ marginTop: 20, padding: 16, background: "#f4f4f5", borderRadius: 8 }}>
              <Link href={"/status/" + token} style={{ fontWeight: 700, color: "#111" }}>
                Track your request
              </Link>
              <p style={{ margin: "6px 0 12px", fontSize: 14, color: "#52525b" }}>
                Save this link to check the status any time. No account needed.
              </p>
              <button type="button" onClick={copyLink} style={{ ...field, width: "auto", cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setCopied(false);
            }}
            style={{ ...field, marginTop: 20, cursor: "pointer" }}
          >
            Send another request
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <div style={card}>
        <h1 style={{ marginTop: 0, marginBottom: 4 }}>Get in touch</h1>
        <p style={{ marginTop: 0, color: "#52525b" }}>Tell us what you need and we will get back to you.</p>

        {savedToken && (
          <p style={{ padding: 12, background: "#f4f4f5", borderRadius: 8, fontSize: 14 }}>
            You have a request in progress.{" "}
            <Link href={"/status/" + savedToken} style={{ fontWeight: 700, color: "#111" }}>
              Track it
            </Link>
          </p>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label htmlFor="name" style={label}>Name</label>
            <input id="name" name="name" required maxLength={100} autoComplete="name" style={field} />
          </div>
          <div>
            <label htmlFor="email" style={label}>Email</label>
            <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
          </div>
          <div>
            <label htmlFor="company" style={label}>
              Company <span style={{ fontWeight: 400, color: "#71717a" }}>(optional)</span>
            </label>
            <input id="company" name="company" maxLength={100} autoComplete="organization" style={field} />
          </div>
          <div>
            <label htmlFor="timeline" style={label}>When do you need this?</label>
            <select id="timeline" name="timeline" required defaultValue="" style={field}>
              <option value="" disabled>Choose one</option>
              {TIMELINES.map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="budget" style={label}>
              Budget <span style={{ fontWeight: 400, color: "#71717a" }}>(optional)</span>
            </label>
            <select id="budget" name="budget" defaultValue="" style={field}>
              {BUDGETS.map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message" style={label}>What are you trying to solve?</label>
            <textarea id="message" name="message" required maxLength={2000} rows={5} style={field} />
          </div>

          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: -9999, opacity: 0 }}
          />

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              opacity: status === "sending" ? 0.6 : 1,
            }}
          >
            {status === "sending" ? "Sending..." : "Send"}
          </button>
          {status === "error" && (
            <p role="alert" style={{ color: "#dc2626", margin: 0 }}>{error}</p>
          )}
          <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>
            We only use your details to reply to your request.
          </p>
        </form>
      </div>
    </main>
  );
}
