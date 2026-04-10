import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/dbConnection.js";
import { projects } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided, authorization denied." });
    }
    
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        req.userId = decoded.userId;
        next();
    }catch (error) {
        return res.status(403).json({ message: "Invalid token, authorization denied." });
    }
}

export const isProjectOwner = async(req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = Number(req.userId);

    try{
        const checkIfOwner = await db.select()
            .from(projects)
            .where(and(
                eq(projects.id, Number(id)), 
                eq(projects.ownerId, userId)))
            .limit(1);

        if (!checkIfOwner){
            return res.status(403).json({ message: "Forbidden: You do not own this project or it does not exist." });
        }
        
        next();
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}