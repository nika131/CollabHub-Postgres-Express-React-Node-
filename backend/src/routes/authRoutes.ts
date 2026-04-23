import { Router } from "express";
import { registerUser, loginUser, refresh } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validations/authSchema.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.post("/refresh", refresh);

router.get("/me", authenticate, getMe);

export default router;