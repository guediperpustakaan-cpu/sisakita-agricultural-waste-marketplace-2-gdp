import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { desc } from "drizzle-orm";

export async function GET() {
  await ensureSeed();
  const rows = await db.select().from(listings).orderBy(desc(listings.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Hanya penyedia yang dapat membuat listing" }, { status: 403 });
  }
  const b = await req.json();
  if (!b.title || !b.quantity || !b.pricePerUnit) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  const [row] = await db
    .insert(listings)
    .values({
      providerId: user.id,
      categoryId: b.categoryId ? Number(b.categoryId) : null,
      title: String(b.title),
      description: b.description ?? null,
      quantity: String(b.quantity),
      unit: b.unit === "KG" ? "KG" : "TON",
      pricePerUnit: String(b.pricePerUnit),
      condition: ["DRY", "WET", "SEMI_DRY"].includes(b.condition) ? b.condition : "DRY",
      latitude: b.latitude != null ? Number(b.latitude) : null,
      longitude: b.longitude != null ? Number(b.longitude) : null,
      imageUrl: b.imageUrl || null,
      status: "AVAILABLE",
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
