CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer,
	"category_id" integer,
	"title" text NOT NULL,
	"description" text,
	"quantity" numeric(12, 3) NOT NULL,
	"unit" text NOT NULL,
	"price_per_unit" numeric(12, 2) NOT NULL,
	"condition" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"image_url" text,
	"status" text DEFAULT 'AVAILABLE',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"buyer_id" integer,
	"listing_id" integer,
	"requested_quantity" numeric(12, 3) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'PENDING',
	"driver_info" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"amount" numeric(12, 2) NOT NULL,
	"method" text DEFAULT 'MIDTRANS',
	"status" text DEFAULT 'UNPAID',
	"escrow_released" boolean DEFAULT false,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone" text,
	"address" text,
	"role" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waste_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_waste_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."waste_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;