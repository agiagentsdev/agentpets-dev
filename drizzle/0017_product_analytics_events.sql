CREATE TABLE IF NOT EXISTS "product_analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "event" text NOT NULL,
  "pet_slug" text,
  "path" text,
  "source" text,
  "referrer" text,
  "referrer_host" text,
  "user_agent_hash" text,
  "ip_hash" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_analytics_event_created_at_idx" ON "product_analytics_events" USING btree ("event", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_analytics_pet_event_created_at_idx" ON "product_analytics_events" USING btree ("pet_slug", "event", "created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_analytics_source_idx" ON "product_analytics_events" USING btree ("source");
