"use client";

import { useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";
import type { ListingRow } from "@/lib/queries";
import { jarakKm } from "@/lib/utils";

type Kategori = { id: number; categoryName: string; description: string | null };

export default function MarketplaceClient({
  listings,
  categories,
}: {
  listings: ListingRow[];
  categories: Kategori[];
}) {
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState<number | "all">("all");
  const [kondisi, setKondisi] = useState<string>("all");
  const [maxHarga, setMaxHarga] = useState<string>("");
  const [radius, setRadius] = useState<string>("");
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>({ lat: -6.2383, lon: 106.9756 });

  const data = useMemo(() => {
    return listings
      .map((l) => ({ l, jarak: jarakKm(pos?.lat ?? null, pos?.lon ?? null, l.latitude, l.longitude) }))
      .filter(({ l, jarak }) => {
        if (q && !`${l.title} ${l.description ?? ""} ${l.categoryName ?? ""}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        if (kategori !== "all" && l.categoryId !== kategori) return false;
        if (kondisi !== "all" && l.condition !== kondisi) return false;
        if (maxHarga && Number(l.pricePerUnit) > Number(maxHarga)) return false;
        if (radius && jarak != null && jarak > Number(radius)) return false;
        return true;
      })
      .sort((a, b) => (a.jarak ?? 1e9) - (b.jarak ?? 1e9));
  }, [listings, q, kategori, kondisi, maxHarga, radius, pos]);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card h-fit p-5">
        <h2 className="font-semibold">Filter</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="q">Cari</label>
            <input id="q" className="input" placeholder="Sekam, jerami..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="kat">Kategori</label>
            <select id="kat" className="input" value={kategori} onChange={(e) => setKategori(e.target.value === "all" ? "all" : Number(e.target.value))}>
              <option value="all">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="kon">Kondisi</label>
            <select id="kon" className="input" value={kondisi} onChange={(e) => setKondisi(e.target.value)}>
              <option value="all">Semua kondisi</option>
              <option value="DRY">Kering</option>
              <option value="SEMI_DRY">Setengah Kering</option>
              <option value="WET">Basah</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="harga">Harga maksimum / unit</label>
            <input id="harga" type="number" className="input" placeholder="cth. 500000" value={maxHarga} onChange={(e) => setMaxHarga(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="rad">Radius (km)</label>
            <input id="rad" type="number" className="input" placeholder="cth. 50" value={radius} onChange={(e) => setRadius(e.target.value)} />
          </div>
          <button
            className="btn-ghost w-full"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
                () => alert("Gagal mengambil lokasi. Menggunakan lokasi default."),
              )
            }
          >
            📍 Gunakan lokasi saya
          </button>
          <button className="btn-ghost w-full" onClick={() => { setQ(""); setKategori("all"); setKondisi("all"); setMaxHarga(""); setRadius(""); }}>
            Reset filter
          </button>
        </div>
      </aside>

      <section>
        <p className="mb-4 text-sm text-slate-600">{data.length} listing ditemukan</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map(({ l, jarak }) => (
            <ListingCard key={l.id} listing={l} jarak={jarak} />
          ))}
        </div>
        {data.length === 0 && (
          <div className="card p-10 text-center text-slate-500">Tidak ada listing yang cocok dengan filter Anda.</div>
        )}
      </section>
    </div>
  );
}
