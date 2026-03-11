import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: varchar("email", {length: 256}).unique().notNull(),
    hashedPassword: text("hashed_password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})