import { notifications } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { db } from "../db/dbConnection.js";
import { type Response } from "express";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const myNotifications = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, Number(req.userId)))
            .orderBy(desc(notifications.createdAt))
            .limit(10);

        res.json(myNotifications);
    }catch (err) {
        res.status(500).json({ message: "Error fetching notification" });
    }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, Number(req.userId)))

        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notifications" });
    }
};

