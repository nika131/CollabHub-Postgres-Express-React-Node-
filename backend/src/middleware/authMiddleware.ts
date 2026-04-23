import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/dbConnection.js";
import { projects } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { AppError } from "../utils/AppError.js";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        throw new AppError("No token provided, authorization denied.", 401);
    }
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        req.userId = decoded.userId;
        next();
    }catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError("Access token expired", 401)
        }
        return res.status(403).json({ message: "Invalid token, authorization denied." });
    }
}

export const isProjectOwner = async(req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = Number(req.userId);

    const checkIfOwner = await db.select()
        .from(projects)
        .where(and(
        eq(projects.id, Number(id)), 
        eq(projects.ownerId, userId)))
    .limit(1);

    if (checkIfOwner.length === 0){
       throw new AppError("Forbidden: You do not own this project or it does not exist.", 403);
    }
        
    next();
}