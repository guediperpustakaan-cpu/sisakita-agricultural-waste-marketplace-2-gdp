/**
 * Seed script for SisaKita (Neon / any PostgreSQL).
 * Idempotent: inserts the demo data only when the tables are empty.
 *
 *   npm run db:migrate   # create schema (drizzle/0000_init.sql)
 *   npm run db:seed      # insert sample data
 */
require("dotenv").config();
const crypto = require("crypto");
const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
  const q = (text, params) => pool.query(text, params);

  const { rows } = await q("select count(*)::int as n from users");
  if (rows[0].n > 0) {
    console.log(`Seed dibatalkan: database sudah berisi data (${rows[0].n} users).`);
    await pool.end();
    return;
  }

  const pw = hashPassword("password123");
  const users = [
    ["Admin SisaKita", "admin@sisakita.id", pw, "ADMIN", true, "08110000001", "Jakarta"],
    ["Pak Slamet (Petani Padi)", "petani@sisakita.id", pw, "PROVIDER", true, "08110000002", "Karawang, Jawa Barat"],
    ["Koperasi Tani Makmur", "koperasi@sisakita.id", pw, "PROVIDER", true, "08110000003", "Malang, Jawa Timur"],
    ["PT Biomassa Nusantara", "industri@sisakita.id", pw, "INDUSTRY", true, "08110000004", "Bekasi, Jawa Barat"],
    ["PT Pelet Energi Hijau", "pabrik@sisakita.id", pw, "INDUSTRY", false, "08110000005", "Surabaya, Jawa Timur"],
  ];
  const userIds = [];
  for (const [name, email, password, role, isVerified, phone, address] of users) {
    const r = await q(
      `insert into users (name, email, password, role, is_verified, phone, address)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [name, email, password, role, isVerified, phone, address],
    );
    userIds.push(r.rows[0].id);
  }
  console.log(`Inserted ${userIds.length} users`);

  const categories = [
    ["Sekam Padi", "Kulit gabah sisa penggilingan padi, bahan bakar biomassa & media tanam."],
    ["Tongkol Jagung", "Limbah janggel jagung untuk briket dan pakan ternak."],
    ["Tandan Kosong Sawit", "Limbah pabrik kelapa sawit untuk kompos & pelet energi."],
    ["Ampas Tebu", "Bagasse sisa penggilingan tebu untuk bahan bakar boiler."],
    ["Jerami Padi", "Batang padi kering untuk pakan ternak dan kompos."],
    ["Sabut & Tempurung Kelapa", "Bahan baku cocopeat dan arang aktif."],
  ];
  const catIds = [];
  for (const [categoryName, description] of categories) {
    const r = await q(
      `insert into waste_categories (category_name, description) values ($1, $2) returning id`,
      [categoryName, description],
    );
    catIds.push(r.rows[0].id);
  }
  console.log(`Inserted ${catIds.length} categories`);

  const [provider1, provider2, buyer] = userIds;
  const listings = [
    [provider1, catIds[0], "Sekam Padi Kering 10 Ton", "Sekam padi hasil penggilingan, kadar air rendah, siap angkut.", "10", "TON", "450000", "DRY", -6.3227, 107.3376, "/img/sekam-padi.svg"],
    [provider1, catIds[4], "Jerami Padi Bal 5 Ton", "Jerami padi dipres bal, cocok untuk pakan ternak.", "5", "TON", "380000", "SEMI_DRY", -6.2907, 107.2951, null],
    [provider2, catIds[1], "Tongkol Jagung 3.000 Kg", "Janggel jagung kering, bersih dari kotoran.", "3000", "KG", "900", "DRY", -7.9666, 112.6326, "/img/tongkol-jagung.svg"],
    [provider2, catIds[3], "Ampas Tebu Segar 20 Ton", "Bagasse langsung dari pabrik gula, kadar air tinggi.", "20", "TON", "300000", "WET", -7.9312, 112.7521, "/img/ampas-tebu.svg"],
    [provider2, catIds[2], "Tandan Kosong Sawit 50 Ton", "Tankos untuk kompos dan pelet energi, kontrak bulanan.", "50", "TON", "250000", "WET", -0.5071, 101.4478, "/img/tandan-sawit.svg"],
    [provider1, catIds[5], "Tempurung Kelapa 8 Ton", "Bahan baku arang aktif, kadar air < 12%.", "8", "TON", "1650000", "DRY", -6.9175, 107.6191, null],
  ];
  const listingIds = [];
  for (const l of listings) {
    const r = await q(
      `insert into listings (provider_id, category_id, title, description, quantity, unit, price_per_unit, condition, latitude, longitude, image_url, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'AVAILABLE') returning id`,
      l,
    );
    listingIds.push(r.rows[0].id);
  }
  console.log(`Inserted ${listingIds.length} listings`);

  const orders = [
    [buyer, listingIds[0], "4", "1800000", "PENDING", null],
    [buyer, listingIds[2], "1000", "900000", "SHIPPING", "Budi - B 9012 KLM"],
    [buyer, listingIds[3], "5", "1500000", "COMPLETED", "Anto - N 1234 XY"],
  ];
  const orderIds = [];
  for (const [buyerId, listingId, requestedQuantity, totalPrice, status, driverInfo] of orders) {
    const r = await q(
      `insert into orders (buyer_id, listing_id, requested_quantity, total_price, status, driver_info)
       values ($1,$2,$3,$4,$5,$6) returning id`,
      [buyerId, listingId, requestedQuantity, totalPrice, status, driverInfo],
    );
    orderIds.push(r.rows[0].id);
  }
  console.log(`Inserted ${orderIds.length} orders`);

  const payments = [
    [orderIds[0], "1800000", "MIDTRANS", "UNPAID", false, null],
    [orderIds[1], "900000", "MIDTRANS", "PAID", false, new Date()],
    [orderIds[2], "1500000", "XENDIT", "PAID", true, new Date()],
  ];
  for (const [orderId, amount, method, status, escrowReleased, paidAt] of payments) {
    await q(
      `insert into payments (order_id, amount, method, status, escrow_released, paid_at)
       values ($1,$2,$3,$4,$5,$6)`,
      [orderId, amount, method, status, escrowReleased, paidAt],
    );
  }
  console.log(`Inserted ${payments.length} payments`);

  await pool.end();
  console.log("Seeding selesai. Login demo: admin@sisakita.id / petani@sisakita.id / industri@sisakita.id (password123)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
