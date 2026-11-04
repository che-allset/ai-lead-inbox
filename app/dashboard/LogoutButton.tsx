"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #d4d4d8", background: "#fff", color: "#111", cursor: "pointer" }}
    >
      Log out
    </button>
  );
}