import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Name is too short" }).max(50, { message: "Name is too long" }),
    email: z.email( { message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export const loginSchema = z.object({
    email: z.email( { message: "Invalid email address" }),
    password: z.string().min( 1, { message: "Password is required" }),
})