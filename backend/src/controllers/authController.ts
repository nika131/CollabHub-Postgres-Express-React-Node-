import { db } from '../db/dbConnection.js';
import { profiles, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';


export const registerUser = async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;

    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
        throw new AppError("Email already registered.", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
            fullName,
            email,
            hashedPassword,
        }).returning();

        if (!newUser) {
            throw new AppError("failed to create user", 400);
        }

        await tx.insert(profiles).values({
            userId: newUser.id,
            bio: "New CollabHub Member",
            interests: [],
            location: "Global",
        });
    });

    res.status(201).json({ message: "User profile created successfully!"})
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user){
        throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword)
    if (!isMatch){
        throw new AppError("Invalid email or password", 401)
    }

    const token = jwt.sign(
        { userId: user.id},
        process.env.JWT_SECRET!,
        { expiresIn: "1d"}
    );

    res.status(200).json({
        message: "succes",
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email}
    });
}

export const getMe = async (req: AuthRequest, res: Response) => {

    const [user] = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, Number(req.userId)));

    if (!user) {
        throw new AppError("User not found!", 404);
    }
    
    res.json(user);
}