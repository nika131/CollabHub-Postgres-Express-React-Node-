import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { joinRequest, getIncomingJoinRequests, respondToJoinRequest } from "../controllers/applicationController.js";


const router = Router();

router.post('/:id/join', authenticate, joinRequest);
router.get('/requests/incoming', authenticate, getIncomingJoinRequests);
router.patch('/requests/:applicationId', authenticate, respondToJoinRequest);

export default router;