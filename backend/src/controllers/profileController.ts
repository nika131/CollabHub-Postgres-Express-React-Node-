import { db } from '../db/dbConnection.js';
import { profiles, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { Request, Response } from "express";

export const updateProfile = async (req: Request, res: Response) => {
    const { bio, location, interests, profilePicUrl } =req.body;
    const userId = (req as any).userId;

    try {
        const updateProfile = await db.update(profiles).set({
            bio,
            location,
            interests,
            profilePicUrl,
            updatedAt: new Date()
        }).where(eq(profiles.userId, userId)).returning();

        if (updateProfile.length === 0) {
            return res.status(404).json({ message: "Profile Not Found"});
        }

        res.status(200).json(updateProfile[0]);
    }catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
}

export const getMyProfile = async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    try {
        const userData = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                profile: true,
            }
        });

        if (!userData) return res.status(404).json({ message: "USer not found"});

        if (!userData.profile) {
            const [newProfile] = await db.insert(profiles).values({
                userId: userId,
                bio: "",
                location: "",
                interests: []
            }).returning();
            
            return res.status(200).json({
                fullName: userData.fullName,
                email: userData.email,
                ...newProfile
            });
        }

        res.status(200).json({
            fullName: userData.fullName,
            email: userData.email,
            ...userData.profile
        });
    }catch (error){
        res.status(500).json({ message: "Error fetching profile"})
    }
};