import { Router } from "express";
import { createProject, getAllProjects, updateProject, DeleteProject, getProjectById, getMyProjects } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProjectSchema } from "../validations/projectSchema.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/", authenticate, validate(createProjectSchema), createProject);

router.get("/:id", authenticate, getProjectById);

router.get("/my/all", authenticate, getMyProjects);

router.get("/", authenticate, getAllProjects);

router.patch("/:id", validate(createProjectSchema), authenticate, updateProject);

router.delete("/:id", validate(createProjectSchema), authenticate, DeleteProject);

export default router;