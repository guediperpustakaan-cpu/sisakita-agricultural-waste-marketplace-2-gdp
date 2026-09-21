import Link from "next/link";
import type { ListingRow } from "@/lib/queries";
import { LABEL_KONDISI, LABEL_STATUS_LISTING, angka, rupiah } from "@/lib/utils";

export default function ListingCard({ listing, jarak }: { listing: ListingRow; jarak?: number | null }) {
  return (
    <article className="card overflow-hidden transition hover:shadow-md">
      <div className="relative h-44 w-full bg-gradient-to-br from-[#2f8f2f]/20 to-[#F5A623]/25">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
        ) : (
          <div className="grid h-44 place-items-center text-5xl">🌱</div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/90 text-[#2f8f2f]">
          {listing.categoryName ?? "Lainnya"}
        </span>
        <span className="badge absolute right-3 top-3 bg-[#F5A623] text-[#3a2a00]">
          {LABEL_STATUS_LISTING[listing.status ?? "AVAILABLE"]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-semibold">{listing.title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {angka(listing.quantity)} {listing.unit} · {LABEL_KONDISI[listing.condition]}
        </p>
        <p className="mt-2 text-xl font-bold text-[#2f8f2f]">
          {rupiah(listing.pricePerUnit)}
          <span className="text-sm font-medium text-slate-500">/{listing.unit.toLowerCase()}</span>
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>📍 {listing.providerAddress ?? "Lokasi tidak diketahui"}</span>
          {jarak != null && <span className="font-semibold text-slate-700">{jarak} km</span>}
        </div>
        <Link href={`/listing/${listing.id}`} className="btn-primary mt-4 w-full">
          Lihat Detail
        </Link>
      </div>
    </article>
  );
}
