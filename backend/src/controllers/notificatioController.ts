import { notifications } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { db } from "../db/dbConnection.js";
import { type Response } from "express";
import { AppError } from "../utils/AppError.js";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    const myNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, Number(req.userId)))
        .orderBy(desc(notifications.createdAt))
        .limit(10);

    if (!myNotifications){
        throw new AppError("No notifications found", 400)
    }

    res.json(myNotifications);
};

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, Number(req.userId)))

    res.json({ message: "All marked as read" });
}

