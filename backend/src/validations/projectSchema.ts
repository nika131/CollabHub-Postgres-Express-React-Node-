import { z } from "zod";

export const createProjectSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    status: z.enum(["active", "compleeted", "looking-for-collab"]).default("active"),
});