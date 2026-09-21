import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getListings, getOrders, getUsers } from "@/lib/queries";
import { angka, rupiah } from "@/lib/utils";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "ADMIN") redirect(user.role === "PROVIDER" ? "/dashboard/penyedia" : "/dashboard/industri");

  const [users, categories, listings, orders] = await Promise.all([
    getUsers(),
    getCategories(),
    getListings(),
    getOrders(),
  ]);

  const volume = categories.map((c) => ({
    label: c.categoryName,
    value: listings
      .filter((l) => l.categoryId === c.id)
      .reduce((a, l) => a + (l.unit === "KG" ? Number(l.quantity) / 1000 : Number(l.quantity)), 0),
  }));

  const stats = [
    { label: "Total pengguna", value: angka(users.length) },
    { label: "Listing", value: angka(listings.length) },
    { label: "Pesanan", value: angka(orders.length) },
    { label: "Nilai transaksi", value: rupiah(orders.reduce((a, o) => a + Number(o.totalPrice), 0)) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Panel Admin</h1>
      <p className="text-slate-600">Pantau ekosistem SisaKita, verifikasi mitra, dan kelola kategori.</p>
      <AdminClient
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isVerified: u.isVerified, address: u.address }))}
        categories={categories}
        volume={volume}
        orders={orders.map((o) => ({ id: o.id, listingTitle: o.listingTitle, buyerName: o.buyerName, status: o.status, totalPrice: String(o.totalPrice) }))}
        stats={stats}
      />
    </div>
  );
}
