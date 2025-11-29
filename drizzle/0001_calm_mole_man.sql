ALTER TABLE "task" DROP CONSTRAINT "task_invoice_id_invoice_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_material_id_material_id_fk";
--> statement-breakpoint
ALTER TABLE "task" DROP CONSTRAINT "task_assigned_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "counted_quantity" numeric(10, 3);--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "count_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "last_count_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_assigned_user_id_user_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;