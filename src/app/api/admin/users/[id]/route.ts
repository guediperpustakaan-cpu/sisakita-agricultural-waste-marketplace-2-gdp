import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Khusus admin" }, { status: 403 });
  const b = await req.json();
  const verified = Boolean(b.isVerified);
  const [row] = await db
    .update(users)
    .set({ isVerified: verified })
    .where(eq(users.id, Number(id)))
    .returning();
  if (!row) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  await db.insert(notifications).values({
    userId: row.id,
    message: verified ? "Akun Anda telah diverifikasi. Akses marketplace aktif." : "Verifikasi akun Anda dicabut admin.",
  });
  return NextResponse.json(row);
}
