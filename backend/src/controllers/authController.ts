import { db } from '../db/dbConnection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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