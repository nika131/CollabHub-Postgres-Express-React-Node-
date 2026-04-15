ALTER TABLE "project_roles" ADD COLUMN "seats_total" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_roles" ADD COLUMN "seats_filled" integer DEFAULT 0 NOT NULL;