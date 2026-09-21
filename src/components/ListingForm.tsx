"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Kategori = { id: number; categoryName: string };

const CONTOH_FOTO = [
  { url: "/img/sekam-padi.jpg", label: "Sekam padi" },
  { url: "/img/tongkol-jagung.jpg", label: "Tongkol jagung" },
  { url: "/img/tandan-sawit.jpg", label: "Tandan sawit" },
  { url: "/img/ampas-tebu.jpg", label: "Ampas tebu" },
];

export default function ListingForm({ categories }: { categories: Kategori[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    imageUrl: "",
    categoryId: String(categories[0]?.id ?? ""),
    title: "",
    description: "",
    quantity: "",
    unit: "TON",
    pricePerUnit: "",
    condition: "DRY",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validasi() {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 5) e.title = "Judul minimal 5 karakter";
    if (!(Number(form.quantity) > 0)) e.quantity = "Kuantitas harus lebih dari 0";
    if (!(Number(form.pricePerUnit) > 0)) e.pricePerUnit = "Harga harus lebih dari 0";
    if (!form.categoryId) e.categoryId = "Pilih kategori";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validasi()) return setStep(2);
    setLoading(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categoryId: Number(form.categoryId),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      return setErrors({ form: d.error ?? "Gagal menyimpan listing" });
    }
    router.push("/dashboard/penyedia");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-6 p-6">
      <ol className="flex gap-2 text-xs font-semibold">
        {["Foto", "Detail", "Lokasi"].map((s, i) => (
          <li
            key={s}
            className={`flex-1 rounded-full px-3 py-2 text-center ${step === i + 1 ? "bg-[#2f8f2f] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="space-y-4">
          <p className="label">Pilih atau tempel URL foto limbah</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {CONTOH_FOTO.map((f) => (
              <button
                type="button"
                key={f.url}
                onClick={() => set("imageUrl", f.url)}
                className={`overflow-hidden rounded-xl border-2 ${form.imageUrl === f.url ? "border-[#2f8f2f]" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.label} className="h-24 w-full object-cover" />
                <span className="block p-1 text-xs">{f.label}</span>
              </button>
            ))}
          </div>
          <input className="input" placeholder="https://... (opsional)" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
          <button type="button" className="btn-primary" onClick={() => setStep(2)}>Lanjut</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="judul">Judul listing</label>
            <input id="judul" className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="label" htmlFor="kat">Kategori limbah</label>
            <select id="kat" className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="label" htmlFor="qty">Kuantitas</label>
              <input id="qty" type="number" step="any" className="input" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
            <div>
              <label className="label" htmlFor="unit">Satuan</label>
              <select id="unit" className="input" value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                <option value="TON">Ton</option>
                <option value="KG">Kilogram</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="harga">Harga / satuan (Rp)</label>
              <input id="harga" type="number" className="input" value={form.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} />
              {errors.pricePerUnit && <p className="mt-1 text-sm text-red-600">{errors.pricePerUnit}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="kondisi">Kondisi</label>
            <select id="kondisi" className="input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
              <option value="DRY">Kering</option>
              <option value="SEMI_DRY">Setengah Kering</option>
              <option value="WET">Basah</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="desk">Deskripsi</label>
            <textarea id="desk" rows={3} className="input" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>Kembali</button>
            <button type="button" className="btn-primary" onClick={() => validasi() && setStep(3)}>Lanjut</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="lat">Latitude</label>
              <input id="lat" className="input" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="lon">Longitude</label>
              <input id="lon" className="input" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (p) => {
                  set("latitude", String(p.coords.latitude));
                  set("longitude", String(p.coords.longitude));
                },
                () => alert("Gagal mengambil koordinat perangkat."),
              )
            }
          >
            📍 Ambil koordinat otomatis
          </button>
          {errors.form && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.form}</p>}
          <div className="flex gap-3">
            <button type="button" className="btn-ghost" onClick={() => setStep(2)}>Kembali</button>
            <button disabled={loading} className="btn-primary">{loading ? "Menyimpan..." : "Simpan Listing"}</button>
          </div>
        </div>
      )}
    </form>
  );
}
