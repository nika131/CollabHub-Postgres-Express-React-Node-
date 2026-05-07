import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError("Too many requests from this IP, please try again after 15 minutes", 429));
    }
})

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new AppError("Too many attempts. for security reasons, please try again in 15 minutes", 429));
    }
});