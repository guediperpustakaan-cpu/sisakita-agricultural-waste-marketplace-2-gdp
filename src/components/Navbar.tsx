"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

type Notif = { id: number; message: string; isRead: boolean | null; createdAt: string | null };

export default function Navbar({ user }: { user: SessionUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () =>
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => setNotifs(Array.isArray(d) ? d : []))
        .catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [user]);

  const unread = notifs.filter((n) => !n.isRead).length;

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "PROVIDER" ? "/dashboard/penyedia" : "/dashboard/industri";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const links = (
    <>
      <Link href="/marketplace" className="px-3 py-2 text-sm font-medium hover:text-[#2f8f2f]">Marketplace</Link>
      <Link href="/peta" className="px-3 py-2 text-sm font-medium hover:text-[#2f8f2f]">Peta</Link>
      {user && (
        <Link href={dashboardHref} className="px-3 py-2 text-sm font-medium hover:text-[#2f8f2f]">Dasbor</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Beranda SisaKita">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#2f8f2f] text-lg text-white">🌾</span>
          <span className="text-xl font-extrabold tracking-tight text-[#2f8f2f]">SisaKita</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="relative">
              <button
                aria-label="Notifikasi"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  if (!notifOpen && unread) {
                    fetch("/api/notifications", { method: "POST" }).then(() =>
                      setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true }))),
                    );
                  }
                }}
                className="relative grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute right-1 top-1 rounded-full bg-[#F5A623] px-1.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 max-h-80 w-80 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  {notifs.length === 0 && <p className="p-3 text-sm text-slate-500">Belum ada notifikasi.</p>}
                  {notifs.map((n) => (
                    <p key={n.id} className="border-b border-slate-100 p-3 text-sm last:border-0">{n.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 lg:inline">Halo, {user.name.split(" ")[0]}</span>
              <button onClick={logout} className="btn-ghost">Keluar</button>
            </>
          ) : (
            <>
              <Link href="/masuk" className="btn-ghost">Masuk</Link>
              <Link href="/daftar" className="btn-primary">Daftar</Link>
            </>
          )}
          <button
            aria-label="Buka menu"
            className="grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </nav>
      {open && <div className="flex flex-col border-t border-slate-200 px-4 py-2 md:hidden">{links}</div>}
    </header>
  );
}
