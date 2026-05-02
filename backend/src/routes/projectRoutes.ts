import { Router } from "express";
import { createProject, getAllProjects, updateProject, DeleteProject, getUserProjects, getProjectAndUserInfobyId, getRecomendedProjects, getParticipatingProjects } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProjectSchema, updateProjectSchema } from "../validations/projectSchema.js";
import { validate } from "../middleware/validate.js";
import { isProjectOwner } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id/all", authenticate, getUserProjects);
router.post("/", authenticate, validate(createProjectSchema), createProject);
router.get("/all", authenticate, getAllProjects);
router.get("/recommended", authenticate, getRecomendedProjects);


router.get("/participatingProjects", authenticate, getParticipatingProjects)
router.get("/:id", authenticate, getProjectAndUserInfobyId);
router.patch("/:id", authenticate, isProjectOwner, validate(updateProjectSchema), updateProject);
router.delete("/:id", authenticate, isProjectOwner, DeleteProject);


export default router;