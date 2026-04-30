import { sql } from "drizzle-orm";
import { projects } from "../db/schema.js";


const projectVector = sql`
    to_tsvector('english',
        coalesce(${projects.title}, '') || ' ' || 
        coalesce(${projects.description}, '') || ' ' ||
        coalesce(array_to_string(${projects.techStack}, ' '), '') 
    )
`;

export const getProjectsSearchUtils = (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === "") return null;

    const query = sql`websearch_to_tsquery('english', ${searchTerm.trim()})`;

    return {
        condition: sql`${projectVector} @@ ${query}`,
        rank: sql`ts_rank(${projectVector}, ${query})`
    };
};