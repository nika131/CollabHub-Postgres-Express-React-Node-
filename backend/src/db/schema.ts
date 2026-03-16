import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profile } from "node:console";

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
    repoUrl: text("repo_url"),
    techStack: text("tech_stack").array(),
    status: text("status").default("active"),
    ownerId: integer("owner_id").references(() => users.id, { onDelete: 'cascade'}).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
})


export const profiles = pgTable("profiles", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade'}).unique().notNull(),
    bio: text("bio"),
    location: text("location"),
    interests: text("interests").array(),
    profilePicUrl: text("profile_pic_url"),
    updatedAt: timestamp("updated_at").defaultNow(),
})

export const userRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [users.id],
        references: [profiles.userId],
    }),
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
    owner: one(users, {
        fields: [projects.ownerId],
        references: [users.id],
    })
}))