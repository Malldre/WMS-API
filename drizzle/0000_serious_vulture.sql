CREATE TYPE "public"."company_status" AS ENUM('ACTIVE', 'INACTIVE', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."company_type" AS ENUM('SUPPLIER', 'CUSTOMER', 'SUPPLIER_CUSTOMER');--> statement-breakpoint
CREATE TYPE "public"."invoice_material_status" AS ENUM('DIVERGENT', 'CONFORMING', 'COUNTING', 'DAMAGED', 'MISSING', 'MISMATCHED', 'WAITING');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('PENDING', 'RECEIVED', 'REJECTED', 'CANCELLED', 'WAITING_INSPECTION');--> statement-breakpoint
CREATE TYPE "public"."load_status" AS ENUM('Cancelled', 'Dispatched', 'Processing', 'Received', 'Rejected', 'Stored');--> statement-breakpoint
CREATE TYPE "public"."material_condition" AS ENUM('NEW', 'USED');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DEVELOPMENT');--> statement-breakpoint
CREATE TYPE "public"."material_unit" AS ENUM('BX', 'CM', 'GR', 'KG', 'LT', 'M2', 'M3', 'ML', 'MT', 'PK', 'UN');--> statement-breakpoint
CREATE TYPE "public"."package_unit" AS ENUM('BX', 'BD', 'LT', 'PL', 'UN');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('ACTIVE', 'DEPRECATED', 'TESTING');--> statement-breakpoint
CREATE TYPE "public"."shipment_order_material_status" AS ENUM('MATERIAL_PICKED', 'MATERIAL_NOT_PICKED', 'MATERIAL_NOT_FOUND', 'SEPARATED', 'WAITING_SEPARATION');--> statement-breakpoint
CREATE TYPE "public"."shipment_order_status" AS ENUM('OPEN', 'DELIVERED', 'CANCELLED', 'ON HOLD');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('PICKING', 'STORAGE', 'CONFERENCE', 'PACKAGING', 'SHIPPING', 'INVENTORY', 'DEMOBILIZATION');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."zone_type" AS ENUM('PICKING', 'BULK', 'STAGING', 'RECEIVING', 'DAMAGED');--> statement-breakpoint
CREATE TABLE "company" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"cnpj" varchar(14) NOT NULL,
	"name" varchar(150) NOT NULL,
	"status" "company_status" DEFAULT 'ACTIVE' NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20),
	"country" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "company_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "cost_center" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"id_external" varchar(255),
	"customer_id" integer NOT NULL,
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20),
	"country" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cost_center_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "customer_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_info_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"material_id" integer NOT NULL,
	"storage_id" integer NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"reserved" numeric(18, 3) DEFAULT '0' NOT NULL,
	"available" numeric(18, 3) GENERATED ALWAYS AS (quantity - reserved) STORED,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "invoice_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"total_value" numeric(18, 2) NOT NULL,
	"unit_value" numeric(18, 6) GENERATED ALWAYS AS (CAST(total_value AS numeric) / CAST(quantity AS numeric)) STORED NOT NULL,
	"status" "invoice_material_status" DEFAULT 'WAITING' NOT NULL,
	"remark" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_item_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(100) NOT NULL,
	"supplier_id" integer NOT NULL,
	"received_at" timestamp NOT NULL,
	"status" "invoice_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "invoice_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "material_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"material_unit" "material_unit" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "material_category_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "material_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "material" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"external_code" varchar(255) NOT NULL,
	"category_id" integer NOT NULL,
	"description" varchar(255) NOT NULL,
	"material_unit" "material_unit" NOT NULL,
	"status" "material_status" DEFAULT 'DEVELOPMENT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "material_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "material_external_code_unique" UNIQUE("external_code")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"service_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(100),
	CONSTRAINT "role_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(100),
	"status" "service_status" DEFAULT 'TESTING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "shipment_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"value" numeric(18, 3) NOT NULL,
	"external_package_id" varchar(255),
	"shipment_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_documents_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "shipment_load" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"shipment_document_id" integer,
	"quantity" numeric(18, 3) NOT NULL,
	"weight" numeric(18, 3) NOT NULL,
	"dimensions" varchar(255) NOT NULL,
	"external_package_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_load_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "shipment_order_material" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"shipment_order_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"status" "shipment_order_material_status" DEFAULT 'WAITING_SEPARATION' NOT NULL,
	"remark" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_order_material_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "shipment_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"cost_center_id" integer NOT NULL,
	"required_date" timestamp NOT NULL,
	"status" "shipment_order_status" DEFAULT 'OPEN' NOT NULL,
	"remark" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_order_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "shipment_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"shipment_order_id" integer NOT NULL,
	"package_type" "package_unit" DEFAULT 'BX' NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"weight" numeric(18, 3) NOT NULL,
	"dimensions" varchar(255) NOT NULL,
	"shipment_load_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipment_packages_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"company_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "supplier_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"company_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supplier_info_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1024),
	"task_type" "task_type" NOT NULL,
	"status" "task_status" DEFAULT 'PENDING' NOT NULL,
	"invoice_id" integer,
	"material_id" integer,
	"item_specification" varchar(255),
	"assigned_user_id" integer,
	"issued_by" varchar(255),
	"entry_date" timestamp,
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user_group_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_group_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"write" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_group_roles_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user_group" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_group_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"write" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_roles_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_group_id" integer,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cost_center" ADD CONSTRAINT "cost_center_customer_id_customer_info_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_info"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_info" ADD CONSTRAINT "customer_info_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_material_id_invoice_item_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."invoice_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_storage_id_storage_id_fk" FOREIGN KEY ("storage_id") REFERENCES "public"."storage"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_supplier_id_supplier_info_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier_info"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_category_id_material_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."material_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_load" ADD CONSTRAINT "shipment_load_shipment_document_id_shipment_documents_id_fk" FOREIGN KEY ("shipment_document_id") REFERENCES "public"."shipment_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_order_material" ADD CONSTRAINT "shipment_order_material_shipment_order_id_shipment_order_id_fk" FOREIGN KEY ("shipment_order_id") REFERENCES "public"."shipment_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_order_material" ADD CONSTRAINT "shipment_order_material_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_order" ADD CONSTRAINT "shipment_order_cost_center_id_cost_center_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_center"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_packages" ADD CONSTRAINT "shipment_packages_shipment_order_id_shipment_order_material_id_fk" FOREIGN KEY ("shipment_order_id") REFERENCES "public"."shipment_order_material"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_packages" ADD CONSTRAINT "shipment_packages_shipment_load_id_shipment_load_id_fk" FOREIGN KEY ("shipment_load_id") REFERENCES "public"."shipment_load"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage" ADD CONSTRAINT "storage_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_info" ADD CONSTRAINT "supplier_info_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_group_roles" ADD CONSTRAINT "user_group_roles_user_group_id_user_group_id_fk" FOREIGN KEY ("user_group_id") REFERENCES "public"."user_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_group_roles" ADD CONSTRAINT "user_group_roles_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;