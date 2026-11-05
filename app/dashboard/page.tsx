import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-server";
import StatusSelect from "./StatusSelect";
import LogoutButton from "./LogoutButton";

const FILTERS = ["all", "hot", "warm", "cold"];
const COLORS: Record<string, string> = {
  hot: "#dc2626",
  warm: "#d97706",
  cold: "#2563eb",
};
const TIMELINES: Record<string, string> = {
  now: "This month",
  soon: "1-3 months",
  exploring: "Just exploring",
};
const BUDGETS: Record<string, string> = {
  unsure: "Budget unsure",
  small: "Under 1,000",
  medium: "1,000-10,000",
  large: "Over 10,000",
};

const chip: React.CSSProperties = {
  padding: "2px 10px",
  borderRadius: 999,
  background: "#f4f4f5",
  color: "#3f3f46",
  fontSize: 12,
  border: "1px solid #e4e4e7",
};

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string }>;
}) {
  return (
    <Suspense fallback={<p style={{ padding: 32 }}>Loading...</p>}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string }>;
}) {
  // Server-side protection: no session means redirect to login.
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { rating } = await searchParams;
  const active = rating && FILTERS.includes(rating) ? rating : "all";

  // Row level security means only logged-in users can read this table.
  // Highest score first, so the hottest leads are always on top.
  let query = supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (active !== "all") query = query.eq("rating", active);
  const { data: leads } = await query;

  return (
    <main style={{ maxWidth: 800, margin: "32px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Lead Inbox</h1>
        <LogoutButton />
      </div>

      <div style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/dashboard" : "/dashboard?rating=" + f}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #d4d4d8",
              textDecoration: "none",
              textTransform: "capitalize",
              background: active === f ? "#111" : "#fff",
              color: active === f ? "#fff" : "#111",
            }}
          >
            {f}
          </Link>
        ))}
      </div>

      {!leads || leads.length === 0 ? (
        <p>No leads yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {leads.map((lead) => (
            <div
              key={lead.id}
              style={{ background: "#fff", color: "#111", border: "1px solid #e4e4e7", borderRadius: 12, padding: 16 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>{lead.name}</strong>
                  {lead.company ? " at " + lead.company : ""}
                  <div style={{ color: "#52525b", fontSize: 14 }}>{lead.email}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", alignSelf: "flex-start" }}>
                  {lead.score !== null && lead.score !== undefined && (
                    <span style={{ fontSize: 13, color: "#52525b" }}>{lead.score}/100</span>
                  )}
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 999,
                      color: "#fff",
                      fontSize: 13,
                      textTransform: "uppercase",
                      background: lead.rating ? COLORS[lead.rating] : "#71717a",
                    }}
                  >
                    {lead.rating ?? "unrated"}
                  </span>
                </div>
              </div>

              {(lead.timeline || lead.budget) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {lead.timeline && <span style={chip}>{TIMELINES[lead.timeline]}</span>}
                  {lead.budget && <span style={chip}>{BUDGETS[lead.budget]}</span>}
                </div>
              )}

              <p style={{ margin: "12px 0 6px" }}>{lead.message}</p>
              {lead.reason && (
                <p style={{ margin: "0 0 12px", color: "#52525b", fontSize: 14 }}>
                  AI reason: {lead.reason}
                </p>
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <StatusSelect id={lead.id} status={lead.status} />
                {lead.contacted_at && (
                  <span style={{ color: "#52525b", fontSize: 13 }}>
                    Contacted on{" "}
                    {new Date(lead.contacted_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
