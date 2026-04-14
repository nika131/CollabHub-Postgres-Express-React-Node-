import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title is too long"),

    description: z.string()
        .max(1000, "Description is too long")
        .optional(),

    repoUrl: z.string()
        .url("Must be a valid URL (e.g., https://github.com/...)")
        .optional(),

    techStack: z.array(z.string().min(1, "Tech stack item cannot be empty"))
        .min(1, "You must provide at least one tech stack item")
        .max(10, "You can provide up to 10 tech stack items"),

    vaultLink: z.string()
        .url("Must be a valid URL (e.g., https://discord.com/...)")
        .optional(),

    roles: z.array(
        z.object({
            title: z.string().min(2, "Role name must be at least 2 characters"),
            seatsTotal: z.number().int().min(1, "You must have at least 1 seat"),
        })
    ).min(1, "You must create at least one open role"),
    
    status: z.enum(["active", "compleeted", "looking-for-collab"])
        .default("active"),
});


export const updateProjectSchema = createProjectSchema.partial();