import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import { globalErrorHandler } from './middleware/errorMiddleware.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';


console.log("JWT Secret Loaded:", !!process.env.JWT_SECRET);

const app = express();
const httpServer = createServer(app);
app.use(cookieParser());

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

export const userSocketMap = new Map<number, string>();

io.on("connection", (Socket) => {
    console.log(`Device connected: ${Socket.id}`);

    Socket.on("register", (userId: number) => {
        userSocketMap.set(userId, Socket.id);
        console.log(`User ${userId} registered to socket ${Socket.id}`);
    });

    Socket.on("disconnect", () => {
        for (let [userId, socketId] of userSocketMap.entries()) {
            for (let[userId, socketId] of userSocketMap.entries()) {
                if (socketId === Socket.id) {
                    userSocketMap.delete(userId);
                    break;
                }
            }
            console.log(`Device disconnected: ${Socket.id}`);
        }
    });
})

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applications", applicationRoutes);

app.use(globalErrorHandler)

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server and WebSocket is running on port ${PORT}`);
})


