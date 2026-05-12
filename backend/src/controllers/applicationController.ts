import { type Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users, applications, notifications, project_roles } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and, ne, sql } from "drizzle-orm";
import { AppError } from "../utils/AppError.js";
import { io, userTOSocket } from "../index.js";

export const joinRequest = async (req: AuthRequest, res: Response) => {
    const projectId = req.params.id; 
    const { roleId } = req.body;
    const userId = Number(req.userId);

    const [project] = await db.select({ 
        ownerId : projects.ownerId, 
        title: projects.title })
    .from(projects)
    .where(eq(projects.id, Number(projectId)));

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
        await tx.insert(applications).values({
            projectId: Number(projectId),
            userId: userId,
            roleId: Number(roleId),
            status: 'pending',
        });

        await tx.insert(notifications).values({
            userId: project.ownerId,
            type: 'new_request',
            message: `Someone applied for the ${targetRole.title} to join your project: ${project.title}`
        });

        

    })

    const applicantSocketId = userTOSocket.get(project.ownerId);
    
    if (applicantSocketId) {
        io.to(applicantSocketId).emit("new_notification", {
            type: 'new_request',
            message: `Someone applied for the ${targetRole.title} to join your project: ${project.title}`,
            createdAt: new Date().toISOString()
        })
        console.log(`WebSocket Sent to User ${project.ownerId}`);
    } else {
        console.log(`User ${project.ownerId} is offline. Notification saved to DB only.`)
    }

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
        seatsTotal: project_roles.seatsTotal,
        seatsFilled: project_roles.seatsFilled,
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
    const { status, confirm, confirmAutoReject } = req.body;
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

        let cascadedRejections: { userId: number }[] = [];

        if (status === 'accepted' ) {
            const [role] = await tx.select().from(project_roles).where(eq(project_roles.id, appData.roleId));

            if (!role || role.seatsFilled >= role.seatsTotal) {
                throw new AppError("this role is already full", 400);
            }

            const isFillingLastSeat = (role.seatsFilled + 1) >= role.seatsTotal;
            if (isFillingLastSeat && !confirm) {
                throw new AppError("CONFIRM_REQUIRED", 409);
            }

            const newFillCount = role.seatsFilled + 1;
            const isNowFilled = newFillCount >= role.seatsTotal;

            await tx.update(project_roles)
                .set({
                    seatsFilled: sql`${project_roles.seatsFilled} + 1`,
                    status: isNowFilled ? 'filled' : 'open'
                })
                .where(eq(project_roles.id, appData.roleId));
            
            if (isNowFilled && confirmAutoReject === true){
                cascadedRejections = await tx.update(applications)
                .set({ status: 'rejected' })
                .where(and(
                    eq(applications.roleId, appData.roleId),
                    eq(applications.status, 'pending'),
                    ne(applications.id, appData.id)
                ))
                .returning({ userId: applications.userId });

                if (cascadedRejections.length > 0) {
                    const bulkNotifications = cascadedRejections.map(rejectedUser => ({
                        userId: rejectedUser.userId,
                        type: 'rejected',
                        message: `The role you applied for in ${appData.projectTitle} has been filled`
                    }))

                    await tx.insert(notifications).values(bulkNotifications);
                }
            }
        }

        await tx.insert(notifications).values({
            userId: appData.applicantId,
            type: status,
            message: `Your request to join ${appData.projectTitle} was ${status}.`
        });

        return  { appData, cascadedRejections };
    })

    const applicantSocketId = userTOSocket.get(result.appData.applicantId);
    if (applicantSocketId) {
        io.to(applicantSocketId).emit("new_notification", {
            type: status,
            message: `Your request to join ${result.appData.projectTitle} was ${status}.`,
            createdAt: new Date().toISOString()
        })
        console.log(`WebSocket Sent to User ${result.appData.applicantId}`);
    } else {
        console.log(`User ${result.appData.applicantId} is offline. Notification saved to DB only.`)
    }

    if(result.cascadedRejections?.length > 0) {
        result.cascadedRejections.forEach(rejectedUSer => {
            const rejectedSocketId = userTOSocket.get(rejectedUSer.userId);
            if (rejectedSocketId) {
                io.to(rejectedSocketId).emit("new_notification", {
                    type: 'rejected',
                    message: `The role you applied for in ${result.appData.projectTitle} has been filled`,
                    createdAt: new Date().toISOString() 
                })
            }
        });
        console.log(`Cascade: Fired ${result.cascadedRejections.length} collateral rejection sockets.`);
    } 

    

    res.json({ message: `Application ${status} successfully` });
};
