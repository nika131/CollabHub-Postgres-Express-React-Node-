import { Router } from "express";
import { createProject, getAllProjects, updateProject, DeleteProject, getProjectById, getMyProjects, getProjectAndUserInfobyId, getIncomingJoinRequests, respondToJoinRequest, joinRequest } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProjectSchema } from "../validations/projectSchema.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/my/all", authenticate, getMyProjects);
router.post("/", authenticate, validate(createProjectSchema), createProject);
router.get("/all", authenticate, getAllProjects);


router.get("/:id", authenticate, getProjectAndUserInfobyId);
router.patch("/:id", authenticate, validate(createProjectSchema), updateProject);
router.delete("/:id", authenticate, DeleteProject);

// Join Request routes
router.post('/:id/join', authenticate, joinRequest);
router.get('/requests/incoming', authenticate, getIncomingJoinRequests);
router.patch('/requests/:applicationId', authenticate, respondToJoinRequest)

export default router;