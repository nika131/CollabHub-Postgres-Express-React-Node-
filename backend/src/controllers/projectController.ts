import { type Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users, applications, project_roles, profiles } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and, ilike, sql, or, not, lt, desc, arrayOverlaps } from "drizzle-orm";
import { baseProjectSelection } from "../db/selectors.js";
import { AppError } from "../utils/AppError.js";
import { cursorPagination } from "../utils/pagination.js";

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
    const { title, description, status, repoUrl, techStack, vaultLink, roles } = req.body;
    const userId = Number(req.userId);

    const result = await db.transaction(async(tx) => {
        const [updatedProject] = await tx.update(projects)
            .set({ title, description, status, repoUrl, techStack, vaultLink })
            .where(and(eq(projects.id, Number(id)), eq(projects.ownerId, userId)))
            .returning();
        
        if (!updatedProject) {
            throw new AppError ("Project not found or you are not the boss", 404)
        }

        if (roles && roles.length > 0) {
            for (const role of roles) {
                if (role.id){
                    const [currentRole] = await tx.select()
                        .from(project_roles)
                        .where(eq(project_roles.id, role.id))

                    if (currentRole) {
                        if (currentRole.seatsFilled > role.seatsTotal) {
                            throw new AppError(`Can not reduce the number of seats below the number of accepted applicants (${currentRole.seatsFilled})`, 400);
                        }

                        const isNowOpen = role.seatsTotal > currentRole.seatsFilled;

                        await tx.update(project_roles)
                            .set({ 
                                title: role.title, 
                                seatsTotal: role.seatsTotal,
                                status: isNowOpen ? 'open' : 'filled'
                            })
                            .where(eq(project_roles.id, role.id));
                    }
                }else {
                    await tx.insert(project_roles).values({
                        projectId: updatedProject.id,
                        title: role.title,
                        seatsTotal: role.seatsTotal
                    });
                }
            }
        }

        return updatedProject;
    })
    
    res.json({ message: "Project updated", project: result });
};

export const getAllProjects = async (req: AuthRequest, res: Response) => {
    const { search, cursor, limit = 10 } = req.query;
    const parsedLimit = Number(limit);

    const statusFilter = not(eq(projects.status, 'closed'));
    const filters = [statusFilter];

    if (search && typeof search === 'string' && search.trim() !== '') {
        const searchTerm = `%${search}%`;

        const searchCondition = or(
            ilike(projects.title, searchTerm),
            sql`array_to_string(${projects.techStack}, ',') ILIKE ${searchTerm}`
        );

        if (searchCondition) {
            filters.push(searchCondition);
        }
    }

    if (cursor) {
        filters.push(lt(projects.id, Number(cursor)));
    }

    const allProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(and(...filters))
        .orderBy(desc(projects.id))
        .limit(parsedLimit + 1);



    res.json(
        cursorPagination(
            allProjects,
            parsedLimit
        )
    );
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


export const getRecomendedProjects = async (req: AuthRequest, res : Response) => {
    const currentUserId = Number(req.userId);
    const { search, cursor, limit = 10 } = req.query;
    const parsedLimit = Number(limit);

    const [userInterests] = await db.select({ interests: profiles.interests})
        .from(profiles)
        .where(eq(profiles.userId, currentUserId));
    
    const interestsArray = userInterests?.interests || [];

    if (interestsArray.length === 0) {
        return res.json({
            data: [],
            nextCursor: null,
            message: "No interests defined in profile. Please update your profile to see recommended projects."
        })
    }

    const statusFilter = not(eq(projects.status, 'closed'));
    const overlapsFilter = arrayOverlaps(projects.techStack, interestsArray);
    const fillters = [statusFilter, overlapsFilter];

    if (search && typeof search === 'string' && search.trim() !== '') {
        const searchTerm = `%${search}%`;

        const searchCondition = or(
            ilike(projects.title, searchTerm),
            sql`array_to_string(${projects.techStack}, ',') ILIKE ${searchTerm}`
        );
        if (searchCondition) fillters.push(searchCondition);
    }

    if (cursor) {
        fillters.push(lt(projects.id, Number(cursor)));
    }

    const mathchingProjects = await db.select(baseProjectSelection)
        .from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id))
        .where(and(...fillters))
        .orderBy(desc(projects.id))
        .limit(parsedLimit + 1);

    res.json(
        cursorPagination(
            mathchingProjects,
            parsedLimit
        )
    );
}

