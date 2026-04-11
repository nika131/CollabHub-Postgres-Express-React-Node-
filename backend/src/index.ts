import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"
import { globalErrorHandler } from './middleware/errorMiddleware.js';

console.log("JWT Secret Loaded:", !!process.env.JWT_SECRET);

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(globalErrorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})


