CREATE TABLE "refresh_token" (
	"id" serial PRIMARY KEY NOT NULL,
	"jti" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"replaced_by" integer,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "refresh_token_jti_unique" UNIQUE("jti")
);
--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;