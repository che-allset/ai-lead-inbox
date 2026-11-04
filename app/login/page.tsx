"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

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

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error) {
      setError("Wrong email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 400, margin: "64px auto", padding: "0 16px" }}>
      <div style={{ background: "#fff", color: "#111", padding: 28, borderRadius: 12, border: "1px solid #e4e4e7" }}>
        <h1 style={{ marginTop: 0 }}>Dashboard login</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <input name="email" type="email" placeholder="Email" required style={input} />
          <input name="password" type="password" placeholder="Password" required style={input} />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: 12, borderRadius: 8, border: 0, background: "#111", color: "#fff", fontSize: 16, cursor: "pointer" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>}
        </form>
      </div>
    </main>
  );
}