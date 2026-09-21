import { notFound } from "next/navigation";
import { getListing } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { LABEL_KONDISI, LABEL_STATUS_LISTING, angka, rupiah } from "@/lib/utils";
import OfferForm from "@/components/OfferForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DetailListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListing(Number(id));
  if (!l) notFound();
  const user = await getCurrentUser();

  const bbox =
    l.latitude != null && l.longitude != null
      ? `${l.longitude - 0.05},${l.latitude - 0.05},${l.longitude + 0.05},${l.latitude + 0.05}`
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/marketplace" className="text-sm text-slate-600 hover:underline">← Kembali ke marketplace</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="card overflow-hidden">
            {l.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.imageUrl} alt={l.title} className="h-80 w-full object-cover" />
            ) : (
              <div className="grid h-80 place-items-center bg-gradient-to-br from-[#2f8f2f]/20 to-[#F5A623]/25 text-7xl">🌱</div>
            )}
          </div>

          <h1 className="mt-6 text-2xl font-bold md:text-3xl">{l.title}</h1>
          <p className="mt-2 text-slate-600">{l.description}</p>

          <h2 className="mt-8 text-lg font-semibold">Spesifikasi</h2>
          <table className="mt-3 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm">
            <tbody>
              {[
                ["Kategori", l.categoryName ?? "-"],
                ["Kondisi", LABEL_KONDISI[l.condition]],
                ["Kuantitas tersedia", `${angka(l.quantity)} ${l.unit}`],
                ["Harga per unit", `${rupiah(l.pricePerUnit)} / ${l.unit.toLowerCase()}`],
                ["Status", LABEL_STATUS_LISTING[l.status ?? "AVAILABLE"]],
                ["Koordinat GPS", l.latitude != null ? `${l.latitude.toFixed(4)}, ${l.longitude?.toFixed(4)}` : "-"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-slate-100 last:border-0">
                  <th className="w-1/3 bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">{k}</th>
                  <td className="px-4 py-3">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {bbox && (
            <>
              <h2 className="mt-8 text-lg font-semibold">Lokasi</h2>
              <iframe
                title="Peta lokasi limbah"
                className="mt-3 h-72 w-full rounded-2xl border border-slate-200"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${l.latitude},${l.longitude}`}
              />
            </>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <p className="text-sm text-slate-500">Harga</p>
            <p className="text-3xl font-extrabold text-[#2f8f2f]">
              {rupiah(l.pricePerUnit)}
              <span className="text-base font-medium text-slate-500">/{l.unit.toLowerCase()}</span>
            </p>
            <OfferForm
              listingId={l.id}
              unit={l.unit}
              maxQty={Number(l.quantity)}
              price={Number(l.pricePerUnit)}
              role={user?.role ?? null}
              verified={Boolean(user?.isVerified)}
            />
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">Profil Penyedia</h2>
            <p className="mt-2 text-lg font-bold">{l.providerName}</p>
            <p className="text-sm text-slate-600">{l.providerAddress}</p>
            <p className="mt-1 text-sm text-slate-600">☎ {l.providerPhone ?? "-"}</p>
            <p className="mt-3 text-sm">
              ⭐ 4.8/5 ·{" "}
              <span className={l.providerVerified ? "text-[#2f8f2f]" : "text-slate-500"}>
                {l.providerVerified ? "Terverifikasi" : "Belum terverifikasi"}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
