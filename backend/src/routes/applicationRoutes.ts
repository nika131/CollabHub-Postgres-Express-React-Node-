import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { joinRequest, getIncomingJoinRequests, respondToJoinRequest} from "../controllers/applicationController.js";
import { validate } from "../middleware/validate.js";
import { JoinRequestSchema, respondRequestSchema } from "../validations/applicationSchema.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post('/:id/join', authenticate, strictLimiter, validate(JoinRequestSchema), joinRequest);
router.get('/requests/incoming', authenticate, getIncomingJoinRequests);
router.patch('/requests/:applicationId', authenticate, validate(respondRequestSchema), respondToJoinRequest);

export default router;