import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate, registerSchema } from "../middleware/validator.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", loginUser);

router.get("/me", authenticate, getMe);

export default router;