import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { COOKIE, signToken, verifyPassword } from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";

export async function POST(req: Request) {
  await ensureSeed();
  const { email, password } = await req.json();
  const rows = await db.select().from(users).where(eq(users.email, String(email ?? "").trim())).limit(1);
  const u = rows[0];
  if (!u || !verifyPassword(String(password ?? ""), u.password)) {
    return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, user: { id: u.id, role: u.role } });
  res.cookies.set(COOKIE, signToken(u.id), { httpOnly: true, path: "/", sameSite: "lax" });
  return res;
}
