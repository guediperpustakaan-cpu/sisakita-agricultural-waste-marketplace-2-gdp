import MarketplaceClient from "@/components/MarketplaceClient";
import { getCategories, getListings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [listings, categories] = await Promise.all([getListings(), getCategories()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Eksplorasi Limbah Pertanian</h1>
      <p className="mt-1 text-slate-600">Temukan pasokan limbah terdekat sesuai kebutuhan industri Anda.</p>
      <MarketplaceClient listings={listings} categories={categories} />
    </div>
  );
}
