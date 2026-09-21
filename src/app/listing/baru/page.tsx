import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import ListingForm from "@/components/ListingForm";

export const dynamic = "force-dynamic";

export default async function TambahListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/masuk");
  if (user.role !== "PROVIDER") redirect("/dashboard/industri");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold md:text-3xl">Tambah Listing Limbah</h1>
      <p className="mt-1 text-slate-600">Lengkapi data limbah Anda agar mudah ditemukan industri.</p>
      <ListingForm categories={categories} />
    </div>
  );
}
