import { Router } from "express";
import { updateProfile, getProfile, updateAvatar } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema } from "../validations/profileSchema.js";

const router = Router();

router.put("/", authenticate, validate(updateProfileSchema), updateProfile);

router.get("/:id", authenticate, getProfile);

router.patch("/avatar", authenticate, upload.single('avatar'), updateAvatar);

export default router