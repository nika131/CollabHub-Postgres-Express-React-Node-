import { z, ZodError } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Name is too short" }).max(50, { message: "Name is too long" }),
    email: z.string().email( { message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export const validate = (schema: z.ZodObject<any>) => (req: any, res: any, next: any) => {
    try{
        schema.parse(req.body);
        next();
    }catch (error: any){
        if (error instanceof ZodError){
            return res.status(400).json({
                message: "Validation failed",
                errors: error.flatten().fieldErrors,
            })
        }
        return res.satatus(500).json({
            message: "Internal server error."
        })
    }
}