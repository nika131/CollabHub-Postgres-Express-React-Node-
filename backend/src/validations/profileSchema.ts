import z from "zod";

export const updateProfileSchema = z.object({
    location: z.string()
        .max(100, { message: "Location is too long" })
        .optional(),
    
    bio: z.string()
        .max(1000, { message: "Bio is too long" })
        .optional(),

    interests: z.array(z.string())
        .max(10, { message: "You can only have up to 10 interests" })
        .optional()
})