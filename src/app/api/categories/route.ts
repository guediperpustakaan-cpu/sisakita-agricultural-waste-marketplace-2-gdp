import { NextResponse } from "next/server";
import { db } from "@/db";
import { wasteCategories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

export async function GET() {
  await ensureSeed();
  return NextResponse.json(await db.select().from(wasteCategories));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Khusus admin" }, { status: 403 });
  const b = await req.json();
  if (!b.categoryName) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
  const [row] = await db
    .insert(wasteCategories)
    .values({ categoryName: String(b.categoryName), description: b.description ?? null })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
