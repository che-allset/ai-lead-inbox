"use client";

import { useState } from "react";
import Link from "next/link";

const field: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: 8,
  fontSize: 16,
  background: "#fff",
  color: "#111",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 14, fontWeight: 600 };
const optional: React.CSSProperties = { fontWeight: 400, color: "#71717a" };

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [firstName, setFirstName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setFirstName(String(data.name).trim().split(" ")[0]);
      setToken(body.token ?? "");
      setStatus("done");
      form.reset();
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", color: "#111", padding: 28, borderRadius: 12, border: "1px solid #e4e4e7" }}>
        {status === "done" ? (
          <div style={{ display: "grid", gap: 14 }}>
            <h1 style={{ margin: 0 }}>Thanks{firstName ? ", " + firstName : ""}!</h1>
            <p style={{ margin: 0 }}>We got your request and will get back to you soon.</p>
            {token && (
              <p style={{ margin: 0 }}>
                <Link href={"/status/" + token} style={{ color: "#111", fontWeight: 600 }}>
                  Track your request
                </Link>
                <br />
                <span style={{ color: "#52525b", fontSize: 14 }}>
                  Save this link to check the status any time. No account needed.
                </span>
              </p>
            )}
            <button
              onClick={() => setStatus("idle")}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #d4d4d8", background: "#fff", color: "#111", fontSize: 15, cursor: "pointer" }}
            >
              Send another request
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
            <div>
              <h1 style={{ margin: "0 0 4px" }}>Get in touch</h1>
              <p style={{ margin: 0, color: "#52525b", fontSize: 14 }}>
                Tell us what you need and we will get back to you.
              </p>
            </div>

            <label style={label}>
              Name
              <input name="name" required maxLength={100} autoComplete="name" style={field} />
            </label>

            <label style={label}>
              Email
              <input name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
            </label>

            <label style={label}>
              <span>Company <span style={optional}>(optional)</span></span>
              <input name="company" maxLength={100} autoComplete="organization" style={field} />
            </label>

            <label style={label}>
              When do you need this?
              <select name="timeline" required defaultValue="" style={field}>
                <option value="" disabled>Choose one</option>
                <option value="now">This month</option>
                <option value="soon">In 1-3 months</option>
                <option value="exploring">Just exploring</option>
              </select>
            </label>

            <label style={label}>
              <span>Budget <span style={optional}>(optional)</span></span>
              <select name="budget" defaultValue="" style={field}>
                <option value="">Prefer not to say</option>
                <option value="unsure">Not sure yet</option>
                <option value="small">Under 1,000</option>
                <option value="medium">1,000 to 10,000</option>
                <option value="large">Over 10,000</option>
              </select>
            </label>

            <label style={label}>
              What are you trying to solve?
              <textarea name="message" required rows={5} maxLength={2000} style={field} />
            </label>

            {/* Honeypot: hidden from people, bots fill it in */}
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px" }}
            />

            <button
              type="submit"
              disabled={status === "sending"}
              style={{ padding: 12, borderRadius: 8, border: 0, background: "#111", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>

            {status === "error" && (
              <p role="alert" style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
            )}

            <p style={{ margin: 0, color: "#71717a", fontSize: 12 }}>
              We only use your details to reply to your request.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
