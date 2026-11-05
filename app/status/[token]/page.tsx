import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase-server";

export const metadata = { title: "Request status", robots: { index: false } };

const STEPS = [
  { key: "new", title: "Received", text: "We got your request and will review it soon." },
  { key: "contacted", title: "We are in touch", text: "Someone from the team has reached out to you." },
  { key: "closed", title: "Closed", text: "Your request has been handled. Thank you!" },
];

const card: React.CSSProperties = {
  background: "#fff",
  color: "#111",
  padding: 28,
  borderRadius: 12,
  border: "1px solid #e4e4e7",
};

export default function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Loading...</p>}>
      <StatusContent params={params} />
    </Suspense>
  );
}

async function StatusContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // The token is a private, unguessable ID. Whoever has the link can see the status.
  let lead: { name: string; status: string; created_at: string } | null = null;
  if (/^[0-9a-f-]{36}$/i.test(token)) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("leads")
      .select("name, status, created_at")
      .eq("status_token", token)
      .maybeSingle();
    lead = data;
  }

  if (!lead) {
    return (
      <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
        <div style={card}>
          <h1 style={{ marginTop: 0 }}>Request not found</h1>
          <p style={{ marginBottom: 0 }}>This link is not valid. Please check that you copied the whole address.</p>
        </div>
      </main>
    );
  }

  const status = lead.status;
  const current = STEPS.findIndex((s) => s.key === status);
  const sent = new Date(lead.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main style={{ maxWidth: 480, margin: "48px auto", padding: "0 16px" }}>
      <div style={card}>
        <h1 style={{ marginTop: 0 }}>Your request</h1>
        <p style={{ color: "#52525b", marginTop: 0 }}>
          {lead.name}, sent on {sent}
        </p>

        <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
          {STEPS.map((step, i) => (
            <div key={step.key} style={{ display: "flex", gap: 14, opacity: i <= current ? 1 : 0.4 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  flexShrink: 0,
                  background: i <= current ? "#111" : "#e4e4e7",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                }}
              >
                {i < current ? "✓" : i + 1}
              </div>
              <div>
                <strong>{step.title}</strong>
                <div style={{ color: "#52525b", fontSize: 14 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
