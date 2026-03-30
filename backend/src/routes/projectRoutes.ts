import { Router } from "express";
import { createProject, getAllProjects, updateProject, DeleteProject, getProjectById, getMyProjects } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProjectSchema } from "../validations/projectSchema.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/my/all", authenticate, getMyProjects);
router.post("/", authenticate, validate(createProjectSchema), createProject);
router.get("/all", authenticate, getAllProjects);


router.get("/:id", authenticate, getProjectById);
router.patch("/:id", validate(createProjectSchema), authenticate, updateProject);
router.delete("/:id", authenticate, DeleteProject);

export default router;