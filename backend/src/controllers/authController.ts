import { db } from '../db/dbConnection.js';
import { profiles, users, refreshTokens } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { v4 as uuidv4 } from 'uuid';

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

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))){
        throw new AppError("Invalid email or password", 401);
    }

    const jti = uuidv4()

    const accessToken = jwt.sign(
        { userId: user.id},
        process.env.JWT_SECRET!,
        { expiresIn: "15m"}
    );

    const refreshToken = jwt.sign(
        { userId: user.id, jti},
        process.env.REFRESH_SECRET!,
        { expiresIn: "1d"}
    )

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await db.insert(refreshTokens).values({
        jti,
        userId: user.id,
        hashedToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
        message: "succes",
        token: accessToken,
        user: { id: user.id, fullName: user.fullName, email: user.email}
    });
}

export const refresh = async (req: AuthRequest, res: Response) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) throw new AppError("No refresh token provided", 401);

    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET!) as { userId: number, jti: string};
    
    const [tokenRecord] = await db.select()
        .from(refreshTokens)
        .where(eq(refreshTokens.jti, decoded.jti));

    if (!tokenRecord || tokenRecord.isRevoked) {
        if (tokenRecord) {
            await db.update(refreshTokens)
                .set({ isRevoked: true})
                .where(eq(refreshTokens.userId, tokenRecord.userId));
        }
        throw new AppError("Security breach detected. Please login again.", 403)
    }

    const isMatch = await bcrypt.compare(oldRefreshToken, tokenRecord.hashedToken );
    if (!isMatch) throw new AppError("Invalid token authenticated", 403);

    const newJti = uuidv4();
    const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET!,
        { expiresIn: "15m"}
    );
    const newRefreshToken = jwt.sign(
        { userId: decoded.userId, jti: newJti},
        process.env.REFRESH_SECRET!,
        { expiresIn: "1d"},
    );

    const newHashedRefresh = await bcrypt.hash(newRefreshToken, 10);

    await db.transaction(async (tx) => {
        await tx.update(refreshTokens)
            .set({ isRevoked: true })
            .where(eq(refreshTokens.id, tokenRecord.id));

        await tx.insert(refreshTokens).values({
            jti: newJti,
            userId: decoded.userId,
            hashedToken: newHashedRefresh,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(200).json({
        token: newAccessToken,
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