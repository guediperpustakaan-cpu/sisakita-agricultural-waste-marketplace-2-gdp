"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { rupiah } from "@/lib/utils";

export default function OfferForm({
  listingId,
  unit,
  maxQty,
  price,
  role,
  verified,
}: {
  listingId: number;
  unit: string;
  maxQty: number;
  price: number;
  role: string | null;
  verified: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState("1");
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!role) {
    return (
      <div className="mt-5 space-y-2">
        <Link href="/masuk" className="btn-primary w-full">Masuk untuk Membeli</Link>
        <p className="text-center text-xs text-slate-500">Khusus akun industri terverifikasi.</p>
      </div>
    );
  }
  if (role !== "INDUSTRY") {
    return <p className="mt-5 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Pembelian hanya untuk akun industri.</p>;
  }
  if (!verified) {
    return (
      <p className="mt-5 rounded-xl bg-[#F5A623]/15 p-3 text-sm text-[#7a4f00]">
        Akun industri Anda menunggu verifikasi admin sebelum dapat memesan.
      </p>
    );
  }

  const total = (Number(qty) || 0) * price;

  async function submit(beliLangsung: boolean) {
    setLoading(true);
    setError(null);
    setPesan(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, requestedQuantity: Number(qty) }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Gagal membuat pesanan");
    if (beliLangsung) {
      await fetch(`/api/orders/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay" }),
      });
    }
    setPesan("Pesanan berhasil dibuat. Cek dasbor industri Anda.");
    router.refresh();
  }

  return (
    <div className="mt-5 space-y-3">
      <label className="label" htmlFor="qty">Kuantitas ({unit})</label>
      <input
        id="qty"
        type="number"
        min={0.001}
        max={maxQty}
        step="any"
        className="input"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />
      <p className="text-sm text-slate-600">Total: <b className="text-slate-900">{rupiah(total)}</b></p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {pesan && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{pesan}</p>}
      <button disabled={loading} onClick={() => submit(false)} className="btn-primary w-full">Ajukan Penawaran</button>
      <button disabled={loading} onClick={() => submit(true)} className="btn-accent w-full">Beli Sekarang (Escrow)</button>
    </div>
  );
}
