import { NextResponse } from "next/server";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  const b = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of ["title", "description", "unit", "condition", "status", "imageUrl"] as const) {
    if (b[k] !== undefined) patch[k] = b[k];
  }
  if (b.quantity !== undefined) patch.quantity = String(b.quantity);
  if (b.pricePerUnit !== undefined) patch.pricePerUnit = String(b.pricePerUnit);
  if (b.categoryId !== undefined) patch.categoryId = Number(b.categoryId);

  const [row] = await db
    .update(listings)
    .set(patch)
    .where(
      user.role === "ADMIN"
        ? eq(listings.id, Number(id))
        : and(eq(listings.id, Number(id)), eq(listings.providerId, user.id)),
    )
    .returning();
  if (!row) return NextResponse.json({ error: "Listing tidak ditemukan" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  await db
    .delete(listings)
    .where(
      user.role === "ADMIN"
        ? eq(listings.id, Number(id))
        : and(eq(listings.id, Number(id)), eq(listings.providerId, user.id)),
    );
  return NextResponse.json({ ok: true });
}
