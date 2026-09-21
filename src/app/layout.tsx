import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SisaKita — Marketplace Limbah Pertanian",
  description:
    "Menghubungkan petani dan kolektor limbah pertanian dengan industri pengolah di seluruh Indonesia.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <html lang="id">
      <body className="bg-[#F4F4F4] text-slate-900 antialiased">
        <Navbar user={user} />
        <main className="min-h-[70vh]">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm md:grid-cols-3">
            <div>
              <p className="text-lg font-bold text-[#2f8f2f]">SisaKita</p>
              <p className="mt-2 text-slate-600">
                Marketplace limbah pertanian untuk industri. Ubah sisa panen menjadi penghasilan.
              </p>
            </div>
            <div>
              <p className="font-semibold">Tautan</p>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li><a href="/marketplace" className="hover:text-[#2f8f2f]">Marketplace</a></li>
                <li><a href="/peta" className="hover:text-[#2f8f2f]">Peta Limbah</a></li>
                <li><a href="/daftar" className="hover:text-[#2f8f2f]">Daftar Akun</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Kontak</p>
              <p className="mt-2 text-slate-600">halo@sisakita.id · 0811-0000-000</p>
              <p className="mt-2 text-slate-500">© {new Date().getFullYear()} SisaKita</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
