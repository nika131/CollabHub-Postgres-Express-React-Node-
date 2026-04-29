import { Router } from "express";
import { updateProfile, getMyProfile, updateAvatar } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.put("/", authenticate, updateProfile);

router.get("/me", authenticate, getMyProfile);

router.patch("/avatar", authenticate, upload.single('avatar'), updateAvatar);

export default router