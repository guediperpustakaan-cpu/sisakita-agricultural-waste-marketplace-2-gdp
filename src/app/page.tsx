import Link from "next/link";
import { getListings, getOrders } from "@/lib/queries";
import { angka, rupiah } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [listings, orders] = await Promise.all([getListings(), getOrders()]);
  const tonTerjual = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((a, o) => a + (o.unit === "KG" ? Number(o.requestedQuantity) / 1000 : Number(o.requestedQuantity)), 0);
  const nilai = orders.reduce((a, o) => a + Number(o.totalPrice), 0);

  const stats = [
    { label: "Ton limbah terjual", value: `${angka(tonTerjual)} ton` },
    { label: "Listing aktif", value: angka(listings.filter((l) => l.status === "AVAILABLE").length) },
    { label: "Nilai transaksi", value: rupiah(nilai) },
    { label: "Mitra industri", value: "120+" },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-[#2f8f2f] via-[#3aa13a] to-[#1f6b1f] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-[#F5A623] text-[#3a2a00]">Ekonomi Sirkular Pertanian</span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
              Sisa panenmu, bahan baku industri mereka.
            </h1>
            <p className="mt-4 max-w-lg text-white/90">
              SisaKita mempertemukan petani, kolektor, dan koperasi dengan pabrik pengolah biomassa,
              pakan ternak, dan kompos. Transparan, terukur, dan pembayaran aman lewat escrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/listing/baru" className="btn-accent">Jual Limbahmu Sekarang</Link>
              <Link href="/marketplace" className="btn bg-white text-[#2f8f2f] hover:bg-slate-100">
                Cari Limbah
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/12 p-5 ring-1 ring-white/25">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-white/85">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">Cara kerja SisaKita</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: "📸", t: "1. Unggah limbah", d: "Penyedia memotret limbah, mengisi kuantitas, harga, dan lokasi GPS." },
            { icon: "🤝", t: "2. Ajukan penawaran", d: "Industri mencari limbah terdekat dan mengajukan penawaran pembelian." },
            { icon: "🚚", t: "3. Kirim & bayar aman", d: "Dana ditahan escrow hingga pembeli mengonfirmasi penerimaan barang." },
          ].map((c) => (
            <div key={c.t} className="card p-6">
              <div className="text-3xl">{c.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{c.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Limbah terbaru</h2>
          <Link href="/marketplace" className="text-sm font-semibold text-[#2f8f2f] hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Kata mitra industri</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              { n: "PT Biomassa Nusantara", q: "Pasokan sekam padi kami kini stabil dan harganya transparan." },
              { n: "CV Pakan Sejahtera", q: "Fitur jarak sangat membantu menekan ongkos logistik hingga 22%." },
              { n: "Koperasi Tani Makmur", q: "Limbah yang dulu dibakar sekarang jadi pemasukan tambahan anggota." },
            ].map((t) => (
              <figure key={t.n} className="card p-6">
                <blockquote className="text-slate-700">“{t.q}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-[#2f8f2f]">{t.n}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
