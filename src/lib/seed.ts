import { db } from "@/db";
import { listings, orders, payments, users, wasteCategories } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

let done = false;

export async function ensureSeed() {
  if (done) return;
  done = true;
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) return;

  const pw = hashPassword("password123");
  const insertedUsers = await db
    .insert(users)
    .values([
      { name: "Admin SisaKita", email: "admin@sisakita.id", password: pw, role: "ADMIN", isVerified: true, phone: "08110000001", address: "Jakarta" },
      { name: "Pak Slamet (Petani Padi)", email: "petani@sisakita.id", password: pw, role: "PROVIDER", isVerified: true, phone: "08110000002", address: "Karawang, Jawa Barat" },
      { name: "Koperasi Tani Makmur", email: "koperasi@sisakita.id", password: pw, role: "PROVIDER", isVerified: true, phone: "08110000003", address: "Malang, Jawa Timur" },
      { name: "PT Biomassa Nusantara", email: "industri@sisakita.id", password: pw, role: "INDUSTRY", isVerified: true, phone: "08110000004", address: "Bekasi, Jawa Barat" },
      { name: "PT Pelet Energi Hijau", email: "pabrik@sisakita.id", password: pw, role: "INDUSTRY", isVerified: false, phone: "08110000005", address: "Surabaya, Jawa Timur" },
    ])
    .returning();

  const cats = await db
    .insert(wasteCategories)
    .values([
      { categoryName: "Sekam Padi", description: "Kulit gabah sisa penggilingan padi, bahan bakar biomassa & media tanam." },
      { categoryName: "Tongkol Jagung", description: "Limbah janggel jagung untuk briket dan pakan ternak." },
      { categoryName: "Tandan Kosong Sawit", description: "Limbah pabrik kelapa sawit untuk kompos & pelet energi." },
      { categoryName: "Ampas Tebu", description: "Bagasse sisa penggilingan tebu untuk bahan bakar boiler." },
      { categoryName: "Jerami Padi", description: "Batang padi kering untuk pakan ternak dan kompos." },
      { categoryName: "Sabut & Tempurung Kelapa", description: "Bahan baku cocopeat dan arang aktif." },
    ])
    .returning();

  const provider1 = insertedUsers[1].id;
  const provider2 = insertedUsers[2].id;
  const buyer = insertedUsers[3].id;

  const ls = await db
    .insert(listings)
    .values([
      { providerId: provider1, categoryId: cats[0].id, title: "Sekam Padi Kering 10 Ton", description: "Sekam padi hasil penggilingan, kadar air rendah, siap angkut.", quantity: "10", unit: "TON", pricePerUnit: "450000", condition: "DRY", latitude: -6.3227, longitude: 107.3376, imageUrl: "/img/sekam-padi.jpg" },
      { providerId: provider1, categoryId: cats[4].id, title: "Jerami Padi Bal 5 Ton", description: "Jerami padi dipres bal, cocok untuk pakan ternak.", quantity: "5", unit: "TON", pricePerUnit: "380000", condition: "SEMI_DRY", latitude: -6.2907, longitude: 107.2951, imageUrl: null },
      { providerId: provider2, categoryId: cats[1].id, title: "Tongkol Jagung 3.000 Kg", description: "Janggel jagung kering, bersih dari kotoran.", quantity: "3000", unit: "KG", pricePerUnit: "900", condition: "DRY", latitude: -7.9666, longitude: 112.6326, imageUrl: "/img/tongkol-jagung.jpg" },
      { providerId: provider2, categoryId: cats[3].id, title: "Ampas Tebu Segar 20 Ton", description: "Bagasse langsung dari pabrik gula, kadar air tinggi.", quantity: "20", unit: "TON", pricePerUnit: "300000", condition: "WET", latitude: -7.9312, longitude: 112.7521, imageUrl: "/img/ampas-tebu.jpg" },
      { providerId: provider2, categoryId: cats[2].id, title: "Tandan Kosong Sawit 50 Ton", description: "Tankos untuk kompos dan pelet energi, kontrak bulanan.", quantity: "50", unit: "TON", pricePerUnit: "250000", condition: "WET", latitude: -0.5071, longitude: 101.4478, imageUrl: "/img/tandan-sawit.jpg" },
      { providerId: provider1, categoryId: cats[5].id, title: "Tempurung Kelapa 8 Ton", description: "Bahan baku arang aktif, kadar air < 12%.", quantity: "8", unit: "TON", pricePerUnit: "1650000", condition: "DRY", latitude: -6.9175, longitude: 107.6191, imageUrl: null },
    ])
    .returning();

  const o = await db
    .insert(orders)
    .values([
      { buyerId: buyer, listingId: ls[0].id, requestedQuantity: "4", totalPrice: "1800000", status: "PENDING" },
      { buyerId: buyer, listingId: ls[2].id, requestedQuantity: "1000", totalPrice: "900000", status: "SHIPPING", driverInfo: "Budi - B 9012 KLM" },
      { buyerId: buyer, listingId: ls[3].id, requestedQuantity: "5", totalPrice: "1500000", status: "COMPLETED", driverInfo: "Anto - N 1234 XY" },
    ])
    .returning();

  await db.insert(payments).values([
    { orderId: o[0].id, amount: "1800000", method: "MIDTRANS", status: "UNPAID" },
    { orderId: o[1].id, amount: "900000", method: "MIDTRANS", status: "PAID", escrowReleased: false, paidAt: new Date() },
    { orderId: o[2].id, amount: "1500000", method: "XENDIT", status: "PAID", escrowReleased: true, paidAt: new Date() },
  ]);
}
