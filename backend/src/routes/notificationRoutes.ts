import { Router } from "express";
import { getMyNotifications, markNotificationsRead } from "../controllers/notificatioController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.patch("/read", authenticate, markNotificationsRead);

export default router