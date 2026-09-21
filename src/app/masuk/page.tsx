"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("industri@sisakita.id");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Gagal masuk");
    const dest =
      data.user.role === "ADMIN" ? "/admin" : data.user.role === "PROVIDER" ? "/dashboard/penyedia" : "/dashboard/industri";
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Masuk ke SisaKita</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pw">Kata Sandi</label>
            <input id="pw" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Memproses..." : "Masuk"}</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Belum punya akun? <Link href="/daftar" className="font-semibold text-[#2f8f2f]">Daftar</Link>
        </p>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold">Akun demo (kata sandi: password123)</p>
          <p>Penyedia: petani@sisakita.id</p>
          <p>Industri: industri@sisakita.id</p>
          <p>Admin: admin@sisakita.id</p>
        </div>
      </div>
    </div>
  );
}
