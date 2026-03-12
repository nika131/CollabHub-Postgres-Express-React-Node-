import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Name is too short" }).max(50, { message: "Name is too long" }),
    email: z.string().email( { message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export const validate = (schema: any) => (req: any, res: any, next: any) => {
    try{
        schema.parse(req.body);
        next();
    }catch (error: any){
        return res.status(400).json({
            errors: error.errors.map((e: any) => e.message)
            
        })
    }
}