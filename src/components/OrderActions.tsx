"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderActions({
  orderId,
  actions,
}: {
  orderId: number;
  actions: { action: string; label: string; style?: "primary" | "accent" | "ghost"; askDriver?: boolean }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run(action: string, askDriver?: boolean) {
    let driverInfo: string | null = null;
    if (askDriver) {
      driverInfo = window.prompt("Masukkan data driver & nomor kendaraan", "Budi - B 1234 XYZ");
      if (!driverInfo) return;
    }
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, driverInfo }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "Aksi gagal");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <button
          key={a.action + a.label}
          disabled={loading}
          onClick={() => run(a.action, a.askDriver)}
          className={
            a.style === "accent" ? "btn-accent px-3 text-xs" : a.style === "ghost" ? "btn-ghost px-3 text-xs" : "btn-primary px-3 text-xs"
          }
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
