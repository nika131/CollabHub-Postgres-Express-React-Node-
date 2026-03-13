import { db } from '../db/dbConnection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from "../middleware/authMiddleware.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export const registerUser = async (req: any, res: any) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already registered."});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.insert(users).values({
            fullName,
            email,
            hashedPassword: hashedPassword,
        });

        res.status(201).json({ message: "User created successfully!"})
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. try again later."})
    }
}

export const loginUser = async (req: any, res: any) => {
    const { email, password } = req.body;
    
    try{
        const [user] = await db.select().from(users).where(eq(users.email, email))

        if (!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword)
        if (!isMatch){
            return res.status(400).json({ message: "Invalid email or password"})
        }

        const token = jwt.sign(
            { userId: user.id},
            process.env.JWT_SECRET!,
            { expiresIn: "1d"}
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, fullName: user.fullName, email: user.email}
        });

    }catch (error: any) {
        res.status(500).json({ message: "Server error", errorName: error.name, errorMessage: error.message});
    };
}

export const getMe = async (req: AuthRequest, res: any) => {
    try {
        const [user] = await db.select().from(users).where(eq(users.id, Number(req.userId)));

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const { hashedPassword, ...userWithouthashedPassword } = user;
        res.json(userWithouthashedPassword);
    }catch (error) {
        res.status(500).json({ message: "Server error. try again later."})
    }
}