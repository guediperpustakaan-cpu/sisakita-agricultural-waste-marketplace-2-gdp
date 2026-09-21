"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DaftarPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "PROVIDER",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) return setError("Kata sandi minimal 6 karakter");
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Gagal mendaftar");
    router.push(form.role === "PROVIDER" ? "/dashboard/penyedia" : "/dashboard/industri");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-sm text-slate-600">Akun industri perlu verifikasi admin sebelum bertransaksi.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="nama">Nama / Nama Usaha</label>
            <input id="nama" required className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" required className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="pw">Kata Sandi</label>
              <input id="pw" type="password" required className="input" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="telp">No. Telepon</label>
              <input id="telp" className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="peran">Peran</label>
              <select id="peran" className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="PROVIDER">Penyedia (Petani/Kolektor)</option>
                <option value="INDUSTRY">Industri (Pembeli)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="alamat">Alamat</label>
            <input id="alamat" className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Memproses..." : "Buat Akun"}</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Sudah punya akun? <Link href="/masuk" className="font-semibold text-[#2f8f2f]">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
