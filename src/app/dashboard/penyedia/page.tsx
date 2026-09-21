import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getListings, getOrders } from "@/lib/queries";
import { LABEL_KONDISI, LABEL_STATUS_LISTING, LABEL_STATUS_ORDER, angka, rupiah } from "@/lib/utils";
import Tabs from "@/components/Tabs";
import ListingActions from "@/components/ListingActions";
import OrderActions from "@/components/OrderActions";

export const dynamic = "force-dynamic";

export default async function DasborPenyedia() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "PROVIDER") redirect(user.role === "ADMIN" ? "/admin" : "/dashboard/industri");

  const [allListings, allOrders] = await Promise.all([getListings(), getOrders()]);
  const myListings = allListings.filter((l) => l.providerId === user.id);
  const myOrders = allOrders.filter((o) => o.providerId === user.id);
  const pendapatan = myOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((a, o) => a + Number(o.totalPrice), 0);
  const escrow = myOrders
    .filter((o) => o.paymentStatus === "PAID" && !o.escrowReleased)
    .reduce((a, o) => a + Number(o.totalPrice), 0);

  const inventaris = (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="p-3">Limbah</th><th className="p-3">Kuantitas</th><th className="p-3">Harga</th>
            <th className="p-3">Kondisi</th><th className="p-3">Status</th><th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {myListings.map((l) => (
            <tr key={l.id} className="border-t border-slate-100">
              <td className="p-3 font-medium"><Link href={`/listing/${l.id}`} className="hover:underline">{l.title}</Link></td>
              <td className="p-3">{angka(l.quantity)} {l.unit}</td>
              <td className="p-3">{rupiah(l.pricePerUnit)}</td>
              <td className="p-3">{LABEL_KONDISI[l.condition]}</td>
              <td className="p-3">{LABEL_STATUS_LISTING[l.status ?? "AVAILABLE"]}</td>
              <td className="p-3"><ListingActions id={l.id} price={String(l.pricePerUnit)} status={l.status ?? "AVAILABLE"} /></td>
            </tr>
          ))}
          {myListings.length === 0 && <tr><td className="p-6 text-slate-500" colSpan={6}>Belum ada listing.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const pesanan = (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="p-3">#</th><th className="p-3">Limbah</th><th className="p-3">Pembeli</th>
            <th className="p-3">Jumlah</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {myOrders.map((o) => (
            <tr key={o.id} className="border-t border-slate-100">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.listingTitle}</td>
              <td className="p-3">{o.buyerName}</td>
              <td className="p-3">{angka(o.requestedQuantity)} {o.unit}</td>
              <td className="p-3">{rupiah(o.totalPrice)}</td>
              <td className="p-3">{LABEL_STATUS_ORDER[o.status ?? "PENDING"]}</td>
              <td className="p-3">
                <OrderActions
                  orderId={o.id}
                  actions={
                    o.status === "PENDING"
                      ? [{ action: "approve", label: "Setujui" }, { action: "reject", label: "Tolak", style: "ghost" }]
                      : o.status === "AGREED"
                        ? [{ action: "ship", label: "Input Driver & Kirim", askDriver: true, style: "accent" }]
                        : []
                  }
                />
              </td>
            </tr>
          ))}
          {myOrders.length === 0 && <tr><td className="p-6 text-slate-500" colSpan={7}>Belum ada pesanan masuk.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const keuangan = (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card p-6"><p className="text-sm text-slate-500">Pendapatan selesai</p><p className="mt-1 text-2xl font-bold text-[#2f8f2f]">{rupiah(pendapatan)}</p></div>
      <div className="card p-6"><p className="text-sm text-slate-500">Dana ditahan escrow</p><p className="mt-1 text-2xl font-bold text-[#F5A623]">{rupiah(escrow)}</p></div>
      <div className="card p-6"><p className="text-sm text-slate-500">Total pesanan</p><p className="mt-1 text-2xl font-bold">{myOrders.length}</p></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dasbor Penyedia</h1>
          <p className="text-slate-600">Selamat datang, {user.name}</p>
        </div>
        <Link href="/listing/baru" className="btn-primary">+ Tambah Listing</Link>
      </div>
      <Tabs
        tabs={[
          { label: "Inventaris", content: inventaris },
          { label: "Pesanan", content: pesanan },
          { label: "Keuangan", content: keuangan },
        ]}
      />
    </div>
  );
}
