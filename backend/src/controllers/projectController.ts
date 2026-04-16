import { type Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users, applications, project_roles } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";
import { baseProjectSelection } from "../db/selectors.js";
import { AppError } from "../utils/AppError.js";

export const createProject = async (req: AuthRequest, res: Response) => {
    const currentUserId = Number(req.userId);
    const { roles, ...projectData } = req.body;

    await db.transaction(async (tx) => {
        const [newProject] = await tx.insert(projects)
            .values({
                ...projectData,
                ownerId: currentUserId
            })
            .returning({ id: projects.id})

        if (!newProject) {
            throw new AppError("Failed to initialize project headder", 500)
        }

        const roleInserts = roles.map((role: { title: string; seatsTotal: number }) => ({
            projectId: newProject?.id,
            title: role.title,
            seatsTotal: role.seatsTotal,
            seatsFilled: 0,
            status: 'open' as const
        }));

        await tx.insert(project_roles).values(roleInserts);
        
        res.status(201).json({
            message: "Projecr and Roles successfully launched!",
            projectId: newProject.id
        })
    })
};

export const DeleteProject = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = Number(req.userId);

    const deleteRows = await db.delete(projects)
        .where(and(eq(projects.id, Number(id)), eq(projects.ownerId, userId)))
        .returning();

    res.json({
        message: "Project deleted successfully",
        deletedProject: deleteRows[0]
    });
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = Number(req.userId);

    const updateRows = await db.update(projects)
        .set({ title, description, status })
        .where(and(eq(projects.id, Number(id)), eq(projects.ownerId, userId)))
        .returning();

    res.json({ message: "Project updated", project: updateRows[0] });
};

export const getAllProjects = async (req: AuthRequest, res: Response) => {
    const allProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id));

    res.json(allProjects);
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    res.json(project);
};

export const getMyProjects = async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);

    const myProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projects.ownerId, userId));
    
    res.json(myProjects);
};

export const getProjectAndUserInfobyId = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const currentUserId = Number(req.userId);

    const [projectAndUserInfo] = await db.select({
        ...baseProjectSelection,
        vaultLink: projects.vaultLink})
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projects.id, Number(id)))
        .limit(1);

    if (!projectAndUserInfo) {
        throw new AppError("Project not found", 404);
    }

    const [userApplication] = await db.select()
        .from(applications)
        .where(and(
            eq(applications.projectId, Number(id)),
            eq(applications.userId, currentUserId)
    ));

    let secureVaultLink = undefined;
    const isOwner = currentUserId === projectAndUserInfo.ownerId;
    const isAcceptedMember = userApplication?.status === 'accepted';
    if( isOwner ||  isAcceptedMember) {
        secureVaultLink = projectAndUserInfo.vaultLink;
    } 

    const projectRolesData = await db.select()
        .from(project_roles)
        .where(eq(project_roles.projectId, Number(id)));

    res.json({
        ...projectAndUserInfo,
        vaultLink: secureVaultLink,
        roles: projectRolesData,
        userStatus: userApplication ? userApplication.status : 'none'
    });
};

