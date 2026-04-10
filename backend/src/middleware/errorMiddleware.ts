import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.code === '23505') {
        statusCode = 400;
        message = "Duplicate entry detected.";
    }

    res.status(statusCode).json({
        status: "error",
        message,
        stack: process.env.NODE_ENV == 'development' ? err.stack : undefined
    });
};