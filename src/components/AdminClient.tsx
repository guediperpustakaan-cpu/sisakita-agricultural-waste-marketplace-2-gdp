"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Tabs from "@/components/Tabs";
import { LABEL_STATUS_ORDER, angka, rupiah } from "@/lib/utils";

type UserRow = { id: number; name: string; email: string; role: string; isVerified: boolean | null; address: string | null };
type Kat = { id: number; categoryName: string; description: string | null };
type Bar = { label: string; value: number };
type OrderMini = { id: number; listingTitle: string | null; buyerName: string | null; status: string | null; totalPrice: string };

export default function AdminClient({
  users,
  categories,
  volume,
  orders,
  stats,
}: {
  users: UserRow[];
  categories: Kat[];
  volume: Bar[];
  orders: OrderMini[];
  stats: { label: string; value: string }[];
}) {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [desk, setDesk] = useState("");
  const max = Math.max(1, ...volume.map((v) => v.value));

  async function verif(id: number, isVerified: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified }),
    });
    router.refresh();
  }

  async function tambahKategori(e: React.FormEvent) {
    e.preventDefault();
    if (!nama) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryName: nama, description: desk }),
    });
    setNama("");
    setDesk("");
    router.refresh();
  }

  const overview = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#2f8f2f]">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold">Volume limbah per kategori (ton)</h2>
        <div className="mt-6 flex h-56 items-end gap-4">
          {volume.map((v) => (
            <div key={v.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-semibold">{angka(v.value)}</span>
              <div
                className="w-full rounded-t-lg bg-[#2f8f2f]"
                style={{ height: `${Math.max(4, (v.value / max) * 170)}px` }}
                aria-label={`${v.label}: ${v.value} ton`}
              />
              <span className="text-center text-[11px] text-slate-600">{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const verifikasi = (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr><th className="p-3">Nama</th><th className="p-3">Email</th><th className="p-3">Peran</th><th className="p-3">Dokumen</th><th className="p-3">Status</th><th className="p-3">Aksi</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3 text-slate-500">NPWP, Izin Usaha</td>
              <td className="p-3">
                <span className={`badge ${u.isVerified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {u.isVerified ? "Terverifikasi" : "Menunggu"}
                </span>
              </td>
              <td className="p-3">
                <button className="btn-ghost px-3 text-xs" onClick={() => verif(u.id, !u.isVerified)}>
                  {u.isVerified ? "Cabut" : "Verifikasi"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const kategori = (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-3">Kategori</th><th className="p-3">Deskripsi</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-slate-100"><td className="p-3 font-medium">{c.categoryName}</td><td className="p-3 text-slate-600">{c.description}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={tambahKategori} className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">Tambah kategori</h2>
        <input className="input" placeholder="Nama kategori" value={nama} onChange={(e) => setNama(e.target.value)} />
        <textarea className="input" rows={3} placeholder="Deskripsi" value={desk} onChange={(e) => setDesk(e.target.value)} />
        <button className="btn-primary w-full">Simpan</button>
      </form>
    </div>
  );

  const dispute = (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600"><tr><th className="p-3">#</th><th className="p-3">Limbah</th><th className="p-3">Pembeli</th><th className="p-3">Nilai</th><th className="p-3">Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-slate-100">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.listingTitle}</td>
              <td className="p-3">{o.buyerName}</td>
              <td className="p-3">{rupiah(o.totalPrice)}</td>
              <td className="p-3">{LABEL_STATUS_ORDER[o.status ?? "PENDING"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { label: "Ringkasan", content: overview },
        { label: "Verifikasi Akun", content: verifikasi },
        { label: "Kategori Limbah", content: kategori },
        { label: "Transaksi & Dispute", content: dispute },
      ]}
    />
  );
}
