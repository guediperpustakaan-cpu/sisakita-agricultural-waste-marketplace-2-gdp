import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { COOKIE, hashPassword, signToken } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

export async function POST(req: Request) {
  await ensureSeed();
  const body = await req.json();
  const { name, email, password, role, phone, address } = body ?? {};
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  if (!["PROVIDER", "INDUSTRY"].includes(role)) {
    return NextResponse.json({ error: "Peran tidak valid" }, { status: 400 });
  }
  const exist = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (exist.length) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const [u] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashPassword(password),
      role,
      phone: phone ?? null,
      address: address ?? null,
      isVerified: role === "PROVIDER",
    })
    .returning();

  const res = NextResponse.json({ ok: true, user: { id: u.id, role: u.role } });
  res.cookies.set(COOKIE, signToken(u.id), { httpOnly: true, path: "/", sameSite: "lax" });
  return res;
}
