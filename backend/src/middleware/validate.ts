import { ZodError, z } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: z.ZodType<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    }catch (error: any){
        if (error instanceof ZodError) {
            const flattened = z.flattenError(error);
            return res.status(400).json({
                message: "Validation failed",
                errors: flattened.fieldErrors,
            });
        }

        return res.status(500).json({ message: "Internal server error."});
    }
};
