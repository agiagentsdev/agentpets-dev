ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_description" text;--> statement-breakpoint
ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_keywords" jsonb;--> statement-breakpoint
ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_intro" text;--> statement-breakpoint
ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_faq" jsonb;--> statement-breakpoint
ALTER TABLE "submitted_pets" ADD COLUMN IF NOT EXISTS "seo_updated_at" timestamp with time zone;
