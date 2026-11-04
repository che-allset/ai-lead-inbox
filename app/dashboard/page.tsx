import Link from "next/link";
import { Suspense } from "react";
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
  let query = supabase
    .from("leads")
    .select("*")
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
                <span
                  style={{
                    alignSelf: "flex-start",
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
              <p style={{ margin: "12px 0 6px" }}>{lead.message}</p>
              {lead.reason && (
                <p style={{ margin: "0 0 12px", color: "#52525b", fontSize: 14 }}>
                  AI reason: {lead.reason}
                </p>
              )}
              <StatusSelect id={lead.id} status={lead.status} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}