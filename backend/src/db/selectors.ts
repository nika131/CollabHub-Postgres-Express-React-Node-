import { projects, users } from "../db/schema.js";

export const baseProjectSelection = {
    id: projects.id,
    title: projects.title,
    description: projects.description,
    repoUrl: projects.repoUrl,
    techStack: projects.techStack,
    status: projects.status,
    createdAt: projects.createdAt,
    ownerId: projects.ownerId,
    ownerName: users.fullName,
    ownerEmail: users.email,
}
