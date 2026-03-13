import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: varchar("email", {length: 256}).unique().notNull(),
    hashedPassword: text("hashed_password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})


export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").default("active"),
    ownerId: integer("owner_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})