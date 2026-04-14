import { type Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users, applications, notifications, project_roles } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";
import { baseProjectSelection } from "../db/selectors.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createProject = catchAsync(async (req: AuthRequest, res: Response) => {
    const currentUserId = Number(req.userId);
    const { roles, ...projectData } = req.body;

    await db.transaction(async (tx) => {
        const [newProject] = await tx.insert(projects)
            .values({
                ...projectData,
                ownerId: currentUserId
            })
            .returning({ id: projects.id})

        const roleInserts = roles.map((role: { title: string; seatsTotal: number }) => ({
            projctId: newProject?.id,
            title: role.title,
            seatsTotal: role.seatsTotal,
            seatsFilled: 0,
            status: 'open' as const
        }));

        await tx.insert(project_roles).values(roleInserts);
        
        res.status(201).json({
            message: "Projecr and Roles successfully launched!",
            projectId: newProject?.id
        })
    })
});

export const DeleteProject = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = Number(req.userId);

    const deleteRows = await db.delete(projects)
        .where(and(eq(projects.id, Number(id)), eq(projects.ownerId, userId)))
        .returning();

    res.json({
        message: "Project deleted successfully",
        deletedProject: deleteRows[0]
    });
});

export const updateProject = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = Number(req.userId);

    const updateRows = await db.update(projects)
        .set({ title, description, status })
        .where(and(eq(projects.id, Number(id)), eq(projects.ownerId, userId)))
        .returning();

    res.json({ message: "Project updated", project: updateRows[0] });
});

export const getAllProjects = catchAsync(async (req: AuthRequest, res: Response) => {
    const allProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id));

    res.json(allProjects);
});

export const getProjectById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    res.json(project);
});

export const getMyProjects = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);

    const myProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(eq(projects.ownerId, userId));
    
    res.json(myProjects);
});

export const getProjectAndUserInfobyId = catchAsync(async (req: AuthRequest, res: Response) => {
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
});

export const joinRequest = catchAsync(async (req: AuthRequest, res: Response) => {
    const { projectId, roleId } = req.body;
    const userId = Number(req.userId);

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) throw new AppError("Project not found", 404);
    
    if (project.ownerId === userId) {
        throw new AppError("You cannot join your own project, boss", 400);
    }

    const [targetRole] = await db.select()
        .from(project_roles)
        .where(eq(project_roles.id, Number(roleId)))

    if(!targetRole) throw new AppError("Role dose not exists", 404);
    if(targetRole.status !== 'open') throw new AppError("This role has already been filled", 400)

    const [existingApp] = await db.select()
        .from(applications)
        .where(and(
            eq(applications.projectId, Number(projectId)), 
            eq(applications.userId, userId),
            eq(applications.roleId, Number(roleId))));

    if (existingApp) {
        throw new AppError("Application already pending or processed", 400);
    }

    await db.insert(applications).values({
        projectId: Number(projectId),
        userId: userId,
        roleId: Number(roleId),
        status: 'pending',
    });

    await db.insert(notifications).values({
        userId: project.ownerId,
        type: 'new_request',
        message: `Someone applied for the ${targetRole.title} to join your project: ${project.title}`
    });

    res.status(201).json({ message: "Application sent successfully" });
});

export const getIncomingJoinRequests = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);

    const incomingJoinRequests = await db.select({
        applicationId: applications.id,
        projectId: projects.id,
        projectTitle: projects.title,
        applicantId: users.id,
        applicantName: users.fullName,
        status: applications.status,
        createdAt: applications.createdAt, 
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(and(
        eq(projects.ownerId, userId),
        eq(applications.status, 'pending')
    ));

    res.json(incomingJoinRequests);
});

export const respondToJoinRequest = catchAsync(async (req: AuthRequest, res: Response) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = Number(req.userId);

    if (!['accepted', 'rejected'].includes(status)) {
        throw new AppError("Invalid status", 400);
    }

    const [applicationData] = await db.select({
        ownerId: projects.ownerId,
        userId: applications.userId
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .where(eq(applications.id, Number(applicationId)));

    if (!applicationData || applicationData.ownerId !== userId) {
        throw new AppError("Forbidden: You do not own this project.", 403);
    }

    await db.update(applications)
        .set({ status })
        .where(eq(applications.id, Number(applicationId)));

    await db.insert(notifications).values({
        userId: applicationData.userId,
        type: status,
        message: status === 'accepted'
            ? `You have been accepted to join the project!`
            : `Your request to join the project was declined.`
    });

    res.json({ message: `Application ${status} successfully` });
});