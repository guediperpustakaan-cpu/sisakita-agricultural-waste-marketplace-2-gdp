import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, notifications, orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "INDUSTRY") {
    return NextResponse.json({ error: "Hanya akun industri yang dapat memesan" }, { status: 403 });
  }
  if (!user.isVerified) {
    return NextResponse.json({ error: "Akun industri Anda belum diverifikasi admin" }, { status: 403 });
  }
  const b = await req.json();
  const listingId = Number(b.listingId);
  const qty = Number(b.requestedQuantity);
  if (!listingId || !qty || qty <= 0) {
    return NextResponse.json({ error: "Kuantitas tidak valid" }, { status: 400 });
  }
  const [l] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
  if (!l) return NextResponse.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  if (qty > Number(l.quantity)) {
    return NextResponse.json({ error: "Kuantitas melebihi stok tersedia" }, { status: 400 });
  }
  const total = qty * Number(l.pricePerUnit);
  const [o] = await db
    .insert(orders)
    .values({
      buyerId: user.id,
      listingId,
      requestedQuantity: String(qty),
      totalPrice: String(total),
      status: "PENDING",
    })
    .returning();
  await db.insert(payments).values({ orderId: o.id, amount: String(total), method: b.method ?? "MIDTRANS", status: "UNPAID" });
  if (l.providerId) {
    await db.insert(notifications).values({
      userId: l.providerId,
      message: `Penawaran baru untuk "${l.title}" sebanyak ${qty} ${l.unit} dari ${user.name}.`,
    });
  }
  return NextResponse.json(o, { status: 201 });
}
