"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

// Dropdown that updates a lead's status in the database.
export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const supabase = createClient();
    await supabase.from("leads").update({ status: e.target.value }).eq("id", id);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={onChange}
      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d4d4d8", fontSize: 14 }}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="closed">Closed</option>
    </select>
  );
}