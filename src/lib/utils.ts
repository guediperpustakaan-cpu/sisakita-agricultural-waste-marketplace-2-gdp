export function rupiah(v: number | string | null | undefined): string {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function angka(v: number | string | null | undefined): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(Number(v ?? 0));
}

export function jarakKm(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)) * 10) / 10;
}

export const LABEL_KONDISI: Record<string, string> = {
  DRY: "Kering",
  WET: "Basah",
  SEMI_DRY: "Setengah Kering",
};

export const LABEL_STATUS_ORDER: Record<string, string> = {
  PENDING: "Menunggu Persetujuan",
  AGREED: "Disetujui",
  SHIPPING: "Dalam Pengiriman",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const LABEL_STATUS_LISTING: Record<string, string> = {
  AVAILABLE: "Tersedia",
  SOLD: "Terjual",
  OUT_OF_STOCK: "Stok Habis",
};

export const TAHAP_ORDER = ["PENDING", "AGREED", "SHIPPING", "COMPLETED"];
