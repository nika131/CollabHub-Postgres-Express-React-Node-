import { type Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users, applications, notifications, project_roles } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";
import { AppError } from "../utils/AppError.js";

export const joinRequest = async (req: AuthRequest, res: Response) => {
    const projectId = req.params.id; 
    const { roleId } = req.body;
    const userId = Number(req.userId);

    const [project] = await db.select().from(projects).where(eq(projects.id, Number(projectId)));
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

    await db.transaction(async (tx) => {
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
    })
    

    res.status(201).json({ message: "Application sent successfully" });
};

export const getIncomingJoinRequests = async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);

    const incomingJoinRequests = await db.select({
        applicationId: applications.id,
        projectId: projects.id,
        projectTitle: projects.title,
        applicantId: users.id,
        applicantName: users.fullName,
        status: applications.status,
        createdAt: applications.createdAt, 
        roleId: applications.roleId,
        roleTitle: project_roles.title,
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .innerJoin(project_roles, eq(applications.roleId, project_roles.id))
    .where(and(
        eq(projects.ownerId, userId),
        eq(applications.status, 'pending')
    ));

    res.json(incomingJoinRequests);
};

export const respondToJoinRequest = async (req: AuthRequest, res: Response) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = Number(req.userId);

    if (!['accepted', 'rejected'].includes(status)) {
        throw new AppError("Invalid status", 400);
    }

    const result = await db.transaction(async (tx) => {
        const [appData] = await tx.select({
            id: applications.id,
            roleId: applications.roleId,
            status: applications.status,
            ownerId: projects.ownerId,
            applicantId: applications.userId,
            projectTitle: projects.title,
        })
        .from(applications)
        .innerJoin(projects, eq(applications.projectId, projects.id))
        .where(eq(applications.id, Number(applicationId)));

        if (!appData || appData.ownerId !== userId) {
            throw new AppError("Forbidden: You do not own this project.", 403);
        }

        if (appData.status !== 'pending') {
            throw new AppError("Request already processed", 400);
        }

        await tx.update(applications)
            .set({ status })
            .where(eq(applications.id, Number(applicationId)));

        if (status === 'accepted') {
            const [role] = await tx.select().from(project_roles).where(eq(project_roles.id, appData.roleId));

            if (!role || role.seatsFilled >= role.seatsTotal) {
                throw new AppError("this role is already full", 400);
            }

            const newFillCount = role.seatsFilled + 1;

            await tx.update(project_roles)
                .set({
                    seatsFilled: newFillCount,
                    status: newFillCount >= role?.seatsTotal ? 'filled' : 'open'
                })
                .where(eq(project_roles.id, appData.roleId));
        }

        return appData
    })
    

    await db.insert(notifications).values({
        userId: result.applicantId,
        type: status,
        message: `Your request to join ${result.projectTitle} was ${status}.`
    });
    
    res.json({ message: `Application ${status} successfully` });
};