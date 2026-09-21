# SisaKita — Marketplace Limbah Pertanian 🌾

**Open Source oleh MZF - 2026**

Marketplace yang menghubungkan petani, kolektor, dan koperasi pemilik limbah pertanian
dengan industri pengolah (biomassa, pakan ternak, kompos, pelet energi) di seluruh Indonesia.
Transparan, terukur, dan pembayaran aman lewat sistem **escrow**.

Web app ini **gratis dan bebas iklan**. Jika ingin mendukung pengembangan & biaya server,
traktir kopi kecil via [Trakteer](https://trakteer.id/perpus_opera/) ☕ (bisa langsung dari
widget mengambang di pojok kanan bawah layar).

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Setup Database (Neon / PostgreSQL)](#setup-database-neon--postgresql)
- [Akun Demo](#akun-demo)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Download Source Code](#download-source-code)
- [Catatan Keamanan](#catatan-keamanan)
- [Lisensi](#lisensi)

---

## Fitur Utama

**Penyedia (Petani / Kolektor / Koperasi)**

- Buat listing limbah: foto, kategori, kuantitas (KG/TON), harga, kondisi (kering/basah), koordinat GPS.
- Kelola inventaris: ubah harga, tandai stok habis, hapus listing.
- Terima / tolak penawaran dari industri, input data driver saat pengiriman.
- Dasbor keuangan: pendapatan selesai dan dana yang sedang ditahan di escrow.

**Industri (Pembeli)**

- Marketplace dengan filter: pencarian, kategori, kondisi, harga maksimum, dan **radius jarak (km)** dari lokasi pembeli.
- Ajukan penawaran atau **Beli Sekarang** dengan pembayaran escrow.
- Lacak status pesanan (Menunggu → Disetujui → Pengiriman → Selesai) dengan progress bar.
- Konfirmasi penerimaan barang untuk melepaskan dana escrow ke penyedia.

**Admin**

- Panel kontrol: statistik pengguna, listing, pesanan, dan nilai transaksi.
- Verifikasi / cabut verifikasi akun industri (wajib sebelum bisa memesan).
- Kelola kategori limbah.
- Grafik volume limbah per kategori & monitor seluruh transaksi.

**Lainnya**

- Peta sebaran limbah (OpenStreetMap) + peta lokasi per listing.
- Notifikasi real-time (polling) untuk provider & pembeli.
- Widget traktiran Trakteer dengan QR code (mulai Rp6.000, tanpa pindah halaman).

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Bahasa | TypeScript 5.9 |
| Styling | Tailwind CSS v4 |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Database | PostgreSQL (Neon) via `node-postgres` |
| Autentikasi | Cookie session HMAC-SHA256 + scrypt (Node `crypto`) |
| QR code | [`qrcode`](https://www.npmjs.com/package/qrcode) (client-side) |
| Hosting | Vercel |

## Struktur Proyek

```text
├── public/img/              # Aset gambar (placeholder SVG)
├── scripts/seed.js          # Skrip seed data sample (idempoten)
├── src/
│   ├── app/                 # Halaman & API routes (App Router)
│   │   ├── api/             # auth, listings, orders, payments-escrow, notifications, categories, admin, source
│   │   ├── admin/           # Panel admin
│   │   ├── dashboard/       # Dasbor penyedia & industri
│   │   ├── listing/         # Detail listing & form tambah listing
│   │   ├── marketplace/     # Marketplace + filter
│   │   ├── peta/            # Peta sebaran
│   │   ├── masuk/ & daftar/ # Login & registrasi
│   │   ├── layout.tsx       # Layout root (Navbar, footer, widget Trakteer)
│   │   └── page.tsx         # Landing page
│   ├── components/          # Komponen React (client & server)
│   ├── db/                  # Skema Drizzle & koneksi pool
│   └── lib/                 # auth, queries, seed, utils, tar generator
├── drizzle/                 # Migrasi SQL (drizzle-kit)
├── drizzle.config.ts        # Konfigurasi Drizzle Kit
└── package.json
```

## Prasyarat

- **Node.js 20+**
- **PostgreSQL** — paling mudah: database serverless [Neon](https://neon.tech/) (gratis tier)
- **Git**

## Menjalankan Secara Lokal

```bash
# 1. Clone repository
git clone https://github.com/guediperpustakaan-cpu/sisakita-agricultural-waste-marketplace-2-gdp.git
cd sisakita-agricultural-waste-marketplace-2-gdp

# 2. Install dependencies
npm install

# 3. Buat file environment variables (lihat .env.example)
cp .env.example .env
#   DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
#   AUTH_SECRET=<string-acak-panjang>

# 4. Buat schema database + isi data sample
npm run db:migrate    # menerapkan drizzle/0000_init.sql
npm run db:seed       # memasukkan data demo (idempoten)

# 5. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Perintah lain yang tersedia:

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Mode development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run db:generate` | Buat file migrasi baru dari perubahan schema |
| `npm run db:migrate` | Terapkan migrasi ke database |
| `npm run db:seed` | Isi data sample |

## Setup Database (Neon / PostgreSQL)

1. Buat project baru di [Neon](https://console.neon.tech/) → salin **connection string (pooled)**.
2. Pasang sebagai `DATABASE_URL` (file `.env` lokal, atau **Environment Variables** di Vercel).
3. Jalankan migrasi dan seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

Skema database terdiri dari 6 tabel:

```text
users              # id, name, email, password, phone, address, role, is_verified
waste_categories   # id, category_name, description
listings           # id, provider_id, category_id, title, quantity, unit, price_per_unit,
                    #   condition, latitude, longitude, image_url, status
orders             # id, buyer_id, listing_id, requested_quantity, total_price, status,
                    #   driver_info, created_at, updated_at
payments           # id, order_id, amount, method, status, escrow_released, paid_at
notifications      # id, user_id, message, is_read, created_at
```

## Akun Demo

Setelah `npm run db:seed`, akun berikut tersedia (semua menggunakan password **`password123`**):

| Email | Peran | Akses |
| --- | --- | --- |
| `admin@sisakita.id` | Admin | `/admin` |
| `petani@sisakita.id` | Penyedia | `/dashboard/penyedia` |
| `koperasi@sisakita.id` | Penyedia | `/dashboard/penyedia` |
| `industri@sisakita.id` | Industri (terverifikasi) | `/dashboard/industri` |
| `pabrik@sisakita.id` | Industri (belum verifikasi) | harus diverifikasi admin dulu |

Data demo: 6 kategori limbah, 6 listing (sekolah padi, jerami, tongkol jagung, ampas tebu,
tandan sawit, tempurung kelapa), 3 pesanan dengan berbagai status, dan 3 record pembayaran.

## Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new) → import repository.
3. Di **Settings → Environment Variables**, tambahkan:
   - `DATABASE_URL` — connection string Neon (wajib)
   - `AUTH_SECRET` — string acak panjang untuk menandatangani cookie session (wajib di produksi)
4. Klik **Deploy**. Vercel otomatis menjalankan `npm install` + `npm run build`.

Pastikan schema & data sudah dibuat di database Neon terlebih dahulu
(lihat [Setup Database](#setup-database-neon--postgresql)).

## Download Source Code

Kode sumber lengkap dapat diunduh dalam dua cara:

- **Dari dalam aplikasi:** link **⬇ Download Source Code** di footer (endpoint `/api/source`
  menghasilkan arsip `sisakita-source.tar.gz` berisi seluruh source).
- **Dari GitHub:** [guediperpustakaan-cpu/sisakita-agricultural-waste-marketplace-2-gdp](https://github.com/guediperpustakaan-cpu/sisakita-agricultural-waste-marketplace-2-gdp)

Arsip berisi `src/`, `public/`, `scripts/`, `drizzle/`, `package.json`, `tsconfig.json`, dan
file konfigurasi lainnya — cukup untuk menjalankan ulang web app ini dari nol
(`npm install` → `db:migrate` → `db:seed` → `npm run dev`).

## Catatan Keamanan

- **Jangan pernah commit file `.env`.** File `.gitignore` sudah meng-exclude `.env*`
  (kecuali `.env.example`).
- Endpoint `/api/source` hanya mengirimkan direktori/file pada *allow-list* — file rahasia
  seperti `.env` dan `node_modules` tidak ikut terbawa.
- Ganti `AUTH_SECRET` dengan nilai acak panjang saat deploy ke produksi.
- Password pengguna disimpan dengan **scrypt + salt acak** (Node `crypto`), bukan plain text.
- Cookie session: `httpOnly` + HMAC-SHA256, sehingga tidak bisa dibaca/dipalsukan dari sisi klien.

## Lisensi

**Open Source oleh MZF - 2026**

Bebas digunakan, dipelajari, dimodifikasi, dan didistribusikan ulang.

Dukung pengembangan & biaya server melalui [Trakteer](https://trakteer.id/perpus_opera/) ☕
— setiap kopi kecil sangat membantu server tetap jalan.
