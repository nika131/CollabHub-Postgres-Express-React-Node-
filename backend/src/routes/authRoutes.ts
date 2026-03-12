import { Router } from "express";
import { registerUser } from "../controllers/authController.js";
import { validate, registerSchema } from "../middleware/validator.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);

export default router;