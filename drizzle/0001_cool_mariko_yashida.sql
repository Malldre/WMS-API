ALTER TABLE "inventory" RENAME COLUMN "material_id" TO "invoice_item_id";--> statement-breakpoint
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_material_id_invoice_item_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_invoice_id_invoice_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_material_id_material_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_assigned_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "photo_id" varchar(255);--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_invoice_item_id_invoice_item_id_fk" FOREIGN KEY ("invoice_item_id") REFERENCES "public"."invoice_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage" ADD CONSTRAINT "storage_name_unique" UNIQUE("name");