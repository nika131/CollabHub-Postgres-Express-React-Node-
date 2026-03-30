import type { Response } from "express";
import { db } from "../db/dbConnection.js";
import { projects, users } from "../db/schema.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";
import { title } from "node:process";
import { stat } from "node:fs";

export const createProject = async (req: AuthRequest, res: Response) => {
    const { title, description, repoUrl, techStack, status } = req.body;

    if(!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        const [newProject] = await db.insert(projects).values({
            title,
            description,
            repoUrl,
            techStack,
            status,
            ownerId: Number(req.userId),
        }).returning();

        res.status(201).json({
            message: "project created successfully",
            project: newProject,
        });
    }catch (error){
        console.error(error);
        res.status(500).json({message: "Failed to create project"})
    }
};

export const DeleteProject = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = Number(req.userId);

    try{
        const deleteRows = await db.delete(projects).where(and(eq(projects.id, Number(id)), eq(projects.ownerId, Number(userId)))).returning();

        if (deleteRows.length === 0) {
            return res.status(403).json({ message: "Forbidden: You do not own this project or it does not exist." });
        }

        res.json({
            message: "Project deleted duccessfully",
            deletedProject: deleteRows[0]
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProject = async ( req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = Number(req.userId);

    try {
        const updateRows = await db.update(projects).set({ title, description, status}).where(and(eq(projects.id, Number(id)), eq(projects.ownerId, Number(userId)))).returning();

        if (updateRows.length === 0){
            return res.status(403).json({
                message: "Forbidden: You do not own this project or it dose not exist."
            });
        }

        res.json({ message: "Project updated", project: updateRows[0]});
    }catch (error){
        res.status(500).json({ message: "Server error"});
    };
}

export const getAllProjects = async (req: AuthRequest, res: Response) => {
    try {
        const allProjects = await db.select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            repoUrl: projects.repoUrl,
            techStack: projects.techStack,
            status: projects.status,
            createdAt: projects.createdAt,
            ownerName: users.fullName,
        }).from(projects)
        .leftJoin(users, eq(projects.ownerId, users.id));
        res.json(allProjects)
    } catch (error){
        res.status(500).json({ message: "Server error"});
    }
};

export const getProjectById = async ( req: AuthRequest, res: Response ) => {
    const { id } = req.params;

    try {
        const [project] = await db.select().from(projects).where(eq(projects.id, Number(id)));

        if (!project) {
            return res.status(404).json({ message: "Project not found"});
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: "Server error"});
    }
};


export const getMyProjects = async (req: AuthRequest, res: Response) => {
    const userId = Number(req.userId);

    try {
        const myProjects = await db.select().from(projects).where(eq(projects.ownerId, userId));
        
        res.json(myProjects);
    } catch (error){
        res.status(500).json({ message: "Server error "});
    }
};
