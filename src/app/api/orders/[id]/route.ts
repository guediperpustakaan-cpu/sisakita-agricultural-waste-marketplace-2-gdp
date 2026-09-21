import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings, notifications, orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const orderId = Number(id);
  const b = await req.json();
  const action: string = b.action;

  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  const [l] = o.listingId
    ? await db.select().from(listings).where(eq(listings.id, o.listingId)).limit(1)
    : [undefined];

  const isProvider = l?.providerId === user.id;
  const isBuyer = o.buyerId === user.id;
  const notify = async (userId: number | null | undefined, message: string) => {
    if (userId) await db.insert(notifications).values({ userId, message });
  };

  let status = o.status ?? "PENDING";
  let driverInfo = o.driverInfo;

  if (action === "approve" && isProvider) {
    status = "AGREED";
    await notify(o.buyerId, `Penawaran Anda untuk "${l?.title}" telah disetujui penyedia.`);
  } else if (action === "reject" && (isProvider || isBuyer)) {
    status = "CANCELLED";
    await notify(isProvider ? o.buyerId : l?.providerId, `Pesanan #${o.id} dibatalkan.`);
  } else if (action === "pay" && isBuyer) {
    await db
      .update(payments)
      .set({ status: "PAID", paidAt: new Date(), escrowReleased: false })
      .where(eq(payments.orderId, orderId));
    await notify(l?.providerId, `Pembayaran pesanan #${o.id} telah masuk dan ditahan di escrow.`);
  } else if (action === "ship" && isProvider) {
    status = "SHIPPING";
    driverInfo = String(b.driverInfo ?? "");
    await notify(o.buyerId, `Pesanan #${o.id} sedang dikirim. Driver: ${driverInfo}`);
  } else if (action === "complete" && isBuyer) {
    status = "COMPLETED";
    await db.update(payments).set({ escrowReleased: true }).where(eq(payments.orderId, orderId));
    if (l) {
      const sisa = Number(l.quantity) - Number(o.requestedQuantity);
      await db
        .update(listings)
        .set({ quantity: String(Math.max(sisa, 0)), status: sisa <= 0 ? "SOLD" : "AVAILABLE" })
        .where(eq(listings.id, l.id));
    }
    await notify(l?.providerId, `Pesanan #${o.id} selesai. Dana escrow telah dilepaskan ke Anda.`);
  } else {
    return NextResponse.json({ error: "Aksi tidak diizinkan" }, { status: 403 });
  }

  const [row] = await db
    .update(orders)
    .set({ status, driverInfo, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning();
  return NextResponse.json(row);
}
