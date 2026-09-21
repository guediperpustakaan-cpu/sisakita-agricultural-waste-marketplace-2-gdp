import { db } from "@/db";
import { listings, orders, payments, users, wasteCategories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";

export type ListingRow = Awaited<ReturnType<typeof getListings>>[number];

export async function getListings() {
  await ensureSeed();
  return db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      quantity: listings.quantity,
      unit: listings.unit,
      pricePerUnit: listings.pricePerUnit,
      condition: listings.condition,
      latitude: listings.latitude,
      longitude: listings.longitude,
      imageUrl: listings.imageUrl,
      status: listings.status,
      createdAt: listings.createdAt,
      categoryId: listings.categoryId,
      categoryName: wasteCategories.categoryName,
      providerId: listings.providerId,
      providerName: users.name,
      providerAddress: users.address,
      providerPhone: users.phone,
      providerVerified: users.isVerified,
    })
    .from(listings)
    .leftJoin(wasteCategories, eq(listings.categoryId, wasteCategories.id))
    .leftJoin(users, eq(listings.providerId, users.id))
    .orderBy(desc(listings.createdAt));
}

export async function getListing(id: number) {
  const all = await getListings();
  return all.find((l) => l.id === id) ?? null;
}

export async function getCategories() {
  await ensureSeed();
  return db.select().from(wasteCategories).orderBy(wasteCategories.id);
}

export async function getOrders() {
  await ensureSeed();
  return db
    .select({
      id: orders.id,
      status: orders.status,
      requestedQuantity: orders.requestedQuantity,
      totalPrice: orders.totalPrice,
      driverInfo: orders.driverInfo,
      createdAt: orders.createdAt,
      buyerId: orders.buyerId,
      buyerName: users.name,
      listingId: orders.listingId,
      listingTitle: listings.title,
      unit: listings.unit,
      providerId: listings.providerId,
      paymentStatus: payments.status,
      escrowReleased: payments.escrowReleased,
    })
    .from(orders)
    .leftJoin(listings, eq(orders.listingId, listings.id))
    .leftJoin(users, eq(orders.buyerId, users.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .orderBy(desc(orders.createdAt));
}

export type OrderRow = Awaited<ReturnType<typeof getOrders>>[number];

export async function getUsers() {
  await ensureSeed();
  return db.select().from(users).orderBy(users.id);
}
