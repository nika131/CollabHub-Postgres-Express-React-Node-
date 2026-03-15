import { Router } from "express";
import { updateProfile, getMyProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.put("/", authenticate, updateProfile);

router.get("me", authenticate, getMyProfile);

export default router