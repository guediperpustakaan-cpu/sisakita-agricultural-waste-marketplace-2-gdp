import Link from "next/link";
import { getListings } from "@/lib/queries";
import { LABEL_KONDISI, angka, rupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PetaPage() {
  const listings = (await getListings()).filter((l) => l.latitude != null && l.longitude != null);
  const lats = listings.map((l) => l.latitude!);
  const lons = listings.map((l) => l.longitude!);
  const bbox = listings.length
    ? `${Math.min(...lons) - 1},${Math.min(...lats) - 1},${Math.max(...lons) + 1},${Math.max(...lats) + 1}`
    : "95,-11,141,6";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Peta Sebaran Limbah</h1>
      <p className="mt-1 text-slate-600">Lihat lokasi pasokan limbah pertanian di seluruh Indonesia.</p>
      <iframe
        title="Peta sebaran limbah"
        className="mt-6 h-[420px] w-full rounded-2xl border border-slate-200"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.id} className="card p-5">
            <p className="font-semibold">{l.title}</p>
            <p className="text-sm text-slate-600">
              {angka(l.quantity)} {l.unit} · {LABEL_KONDISI[l.condition]} · {rupiah(l.pricePerUnit)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              📍 {l.latitude?.toFixed(3)}, {l.longitude?.toFixed(3)} — {l.providerAddress}
            </p>
            <Link href={`/listing/${l.id}`} className="btn-ghost mt-3 w-full">Lihat Detail</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
