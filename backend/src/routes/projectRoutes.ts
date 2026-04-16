import { Router } from "express";
import { createProject, getAllProjects, updateProject, DeleteProject, getMyProjects, getProjectAndUserInfobyId } from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProjectSchema, updateProjectSchema } from "../validations/projectSchema.js";
import { validate } from "../middleware/validate.js";
import { isProjectOwner } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/my/all", authenticate, getMyProjects);
router.post("/", authenticate, validate(createProjectSchema), createProject);
router.get("/all", authenticate, getAllProjects);


router.get("/:id", authenticate, getProjectAndUserInfobyId);
router.patch("/:id", authenticate, isProjectOwner, validate(updateProjectSchema), updateProject);
router.delete("/:id", authenticate, isProjectOwner, DeleteProject);


export default router;