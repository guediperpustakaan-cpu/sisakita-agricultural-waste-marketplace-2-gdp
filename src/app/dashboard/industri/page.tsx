import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getListings, getOrders } from "@/lib/queries";
import { angka, rupiah } from "@/lib/utils";
import Tabs from "@/components/Tabs";
import OrderActions from "@/components/OrderActions";
import ProgressOrder from "@/components/ProgressOrder";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function DasborIndustri() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "INDUSTRY") redirect(user.role === "ADMIN" ? "/admin" : "/dashboard/penyedia");

  const [listings, allOrders] = await Promise.all([getListings(), getOrders()]);
  const myOrders = allOrders.filter((o) => o.buyerId === user.id);
  const aktif = myOrders.filter((o) => ["PENDING", "AGREED", "SHIPPING"].includes(o.status ?? ""));
  const riwayat = myOrders.filter((o) => ["COMPLETED", "CANCELLED"].includes(o.status ?? ""));
  const pengiriman = myOrders.filter((o) => o.status === "SHIPPING");

  const kartuOrder = (o: (typeof myOrders)[number]) => (
    <div key={o.id} className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">#{o.id} · {o.listingTitle}</p>
          <p className="text-sm text-slate-600">
            {angka(o.requestedQuantity)} {o.unit} · {rupiah(o.totalPrice)} ·{" "}
            {o.paymentStatus === "PAID" ? (o.escrowReleased ? "Dana dilepas" : "Dibayar (escrow)") : "Belum dibayar"}
          </p>
          {o.driverInfo && <p className="mt-1 text-sm text-slate-500">🚚 {o.driverInfo}</p>}
        </div>
        <OrderActions
          orderId={o.id}
          actions={[
            ...(o.paymentStatus !== "PAID" && o.status !== "CANCELLED"
              ? [{ action: "pay", label: "Bayar (Escrow)", style: "accent" as const }]
              : []),
            ...(o.status === "SHIPPING" ? [{ action: "complete", label: "Konfirmasi Diterima" }] : []),
            ...(o.status === "PENDING" ? [{ action: "reject", label: "Batalkan", style: "ghost" as const }] : []),
          ]}
        />
      </div>
      <div className="mt-4"><ProgressOrder status={o.status ?? "PENDING"} /></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dasbor Industri</h1>
          <p className="text-slate-600">
            {user.name} ·{" "}
            <span className={user.isVerified ? "text-[#2f8f2f]" : "text-[#b97600]"}>
              {user.isVerified ? "Akun terverifikasi" : "Menunggu verifikasi admin"}
            </span>
          </p>
        </div>
        <Link href="/marketplace" className="btn-primary">Cari Limbah</Link>
      </div>

      <Tabs
        tabs={[
          {
            label: "Cari Limbah",
            content: (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 6).map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            ),
          },
          {
            label: `Order Aktif (${aktif.length})`,
            content: aktif.length ? <div className="space-y-4">{aktif.map(kartuOrder)}</div> : <p className="card p-6 text-slate-500">Belum ada order aktif.</p>,
          },
          {
            label: "Pengiriman",
            content: pengiriman.length ? <div className="space-y-4">{pengiriman.map(kartuOrder)}</div> : <p className="card p-6 text-slate-500">Tidak ada pengiriman berjalan.</p>,
          },
          {
            label: "Riwayat",
            content: riwayat.length ? <div className="space-y-4">{riwayat.map(kartuOrder)}</div> : <p className="card p-6 text-slate-500">Belum ada riwayat transaksi.</p>,
          },
        ]}
      />
    </div>
  );
}
