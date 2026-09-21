"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListingActions({
  id,
  price,
  status,
}: {
  id: number;
  price: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        disabled={busy}
        className="btn-ghost px-3 text-xs"
        onClick={() => {
          const v = window.prompt("Harga baru per satuan (Rp)", price);
          if (v && Number(v) > 0) patch({ pricePerUnit: v });
        }}
      >
        Edit Harga
      </button>
      <button
        disabled={busy}
        className="btn-ghost px-3 text-xs"
        onClick={() => patch({ status: status === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE" })}
      >
        {status === "AVAILABLE" ? "Tandai Habis" : "Aktifkan"}
      </button>
      <button
        disabled={busy}
        className="btn px-3 text-xs bg-red-50 text-red-700 hover:bg-red-100"
        onClick={async () => {
          if (!confirm("Hapus listing ini?")) return;
          setBusy(true);
          await fetch(`/api/listings/${id}`, { method: "DELETE" });
          setBusy(false);
          router.refresh();
        }}
      >
        Hapus
      </button>
    </div>
  );
}
