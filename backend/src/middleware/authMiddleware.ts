import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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