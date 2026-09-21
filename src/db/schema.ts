import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull(), // PROVIDER | INDUSTRY | ADMIN
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wasteCategories = pgTable("waste_categories", {
  id: serial("id").primaryKey(),
  categoryName: text("category_name").notNull(),
  description: text("description"),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => wasteCategories.id),
  title: text("title").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: text("unit").notNull(), // KG | TON
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }).notNull(),
  condition: text("condition").notNull(), // DRY | WET | SEMI_DRY
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  imageUrl: text("image_url"),
  status: text("status").default("AVAILABLE"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").references(() => users.id, { onDelete: "set null" }),
  listingId: integer("listing_id").references(() => listings.id, { onDelete: "set null" }),
  requestedQuantity: numeric("requested_quantity", { precision: 12, scale: 3 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("PENDING"), // PENDING|AGREED|SHIPPING|COMPLETED|CANCELLED
  driverInfo: text("driver_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").default("MIDTRANS"),
  status: text("status").default("UNPAID"), // UNPAID|PAID|REFUNDED (escrow: PAID = ditahan)
  escrowReleased: boolean("escrow_released").default(false),
  paidAt: timestamp("paid_at"),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
