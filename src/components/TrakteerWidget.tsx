"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";

const TRAKTEER_URL = "https://trakteer.id/perpus_opera/";
const CREDIT = "Open Source oleh MZF - 2026";
const STORAGE_KEY = "sk-trakteer";

// Nominal traktiran: mulai dari Rp6.000 dan kelipatannya.
const NOMINALS = [6000, 12000, 18000, 24000, 30000, 60000];

const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStored(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "expanded";
  } catch {
    return "expanded";
  }
}

export default function TrakteerWidget() {
  // Snapshot server selalu "expanded" (SSR + hidrasi selaras), lalu memakai
  // preferensi tersimpan di browser setelah hidrasi selesai.
  const stored = useSyncExternalStore(subscribe, readStored, () => "expanded");
  const expanded = stored !== "collapsed";

  const [open, setOpen] = useState(false);
  const [nominal, setNominal] = useState(6000);
  const [qr, setQr] = useState<string | null>(null);

  const tipUrl = `${TRAKTEER_URL}tip?amount=${nominal}`;

  function collapse() {
    try {
      localStorage.setItem(STORAGE_KEY, "collapsed");
    } catch {
      /* storage tidak tersedia — abaikan */
    }
  }

  useEffect(() => {
    if (!open) return;
    let active = true;
    QRCode.toDataURL(tipUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#24242c", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setQr(url);
      })
      .catch(() => setQr(null));
    return () => {
      active = false;
    };
  }, [open, tipUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {expanded ? (
          <div className="flex w-[min(19rem,calc(100vw-1.5rem))] items-center gap-3 rounded-2xl border border-orange-200 bg-white p-3 pr-2 shadow-xl shadow-orange-900/10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Web app ini gratis &amp; bebas iklan.</p>
              <p className="text-xs text-slate-500">Kopi kecil, server tetap jalan ☕</p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 shrink-0 items-center rounded-xl bg-gradient-to-br from-[#FF8A3D] to-[#F45B27] px-4 text-sm font-bold text-white shadow-md transition hover:brightness-95"
            >
              Traktir
            </button>
            <button
              aria-label="Ciutkan widget traktiran"
              onClick={collapse}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            aria-label="Buka widget traktiran"
            onClick={() => setOpen(true)}
            className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#F45B27] text-2xl text-white shadow-lg shadow-orange-900/25 transition hover:scale-105"
          >
            ☕
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Traktir web app ini via Trakteer"
            className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#FF8A3D] to-[#F45B27] px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">☕ Traktir Web App Ini</p>
                  <p className="mt-1 text-sm text-white/90">
                    Web app ini gratis &amp; bebas iklan. Kopi kecil, server tetap jalan.
                  </p>
                </div>
                <button
                  aria-label="Tutup"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/90 transition hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="label">Pilih nominal traktiran</p>
              <div className="flex flex-wrap gap-2">
                {NOMINALS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNominal(n)}
                    className={`min-h-10 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      nominal === n
                        ? "bg-gradient-to-br from-[#FF8A3D] to-[#F45B27] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {rp(n)}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr} alt={`QR Trakteer untuk traktiran ${rp(nominal)}`} width={208} height={208} />
                  ) : (
                    <div className="h-52 w-52 animate-pulse rounded-xl bg-slate-100" />
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Scan QR ini dengan HP kamu — halaman ini tetap terbuka, tanpa pindah halaman.
                </p>
              </div>

              <a href={tipUrl} target="_blank" rel="noopener noreferrer" className="btn-accent mt-5 w-full">
                Buka langsung di Trakteer →
              </a>

              <p className="mt-5 text-center text-xs text-slate-400">{CREDIT}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
