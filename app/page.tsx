"use client";

import { useState } from "react";

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d4d4d8",
  borderRadius: 8,
  fontSize: 16,
  background: "#fff",
  color: "#111",
  boxSizing: "border-box",
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus("done");
      form.reset();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", color: "#111", padding: 28, borderRadius: 12, border: "1px solid #e4e4e7" }}>
        <h1 style={{ marginTop: 0 }}>Get in touch</h1>

        {status === "done" ? (
          <p>Thanks! We will get back to you soon.</p>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <input name="name" placeholder="Name" required maxLength={100} style={input} />
            <input name="company" placeholder="Company" maxLength={100} style={input} />
            <input name="email" type="email" placeholder="Email" required maxLength={200} style={input} />
            <textarea name="message" placeholder="Message" required rows={5} maxLength={2000} style={input} />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{ padding: 12, borderRadius: 8, border: 0, background: "#111", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
            {status === "error" && <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}