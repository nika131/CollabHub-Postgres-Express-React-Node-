import { useEffect, useState } from "react";
import api from "../api/axios";
import { ProjectCard } from "../components/dashboard/ProjectCard";

export default function Explore() {
    const [projects, setProjects ] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAllProjects();
    }, []);

    const fetchAllProjects = async () => {
        try {
            const res = await api.get('/projects/all');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch explore feed", err);
        }
    };

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.techStack?.some((tech: string) => tech.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-blue-500">Explore Projects</h1>

                    <input 
                        type="text"
                        placeholder="Search by title or tech (e.g. React)..."
                        className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={(e) => setSearch(e.target.value)}  
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={fetchAllProjects}
                            />
                        ))
                    ) : (
                        <p className="text-zinc-500 italic">No projects found matching search</p>
                    )}
                </div>
            </div>
        </div>
    );
}