import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Explore() {
    const [projects, setProjects ] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const res = await api.get('/projects/all');
                setProjects(res.data);
            } catch (err) {
                console.error("Failed to fetch explore feed", err);
            }
        };
        fetchAllProjects();
    }, []);

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
                            <div key={project.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transaction flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-blue-400">{project.title}</h4>
                                    <p className="text-zinc-500 text-xs mb-2">By : {project.ownerName || "Anonymous"}</p>
                                    <p className="text-zinc-400 text-sm line-clamp-3">{project.description}</p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {project.techStack?.map((tech: string) => (
                                            <span key={tech} className="text-[10px] bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-zinc-300">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                                        <a href="{project.repoUrl}" target="_blank" className="text-sm text-blue-500 hover:underline">
                                            View Repo
                                        </a>
                                        <span className="text-[10px] text-zinc-600 uppercase tracking-widset">
                                            {project.status || 'Active'}
                                        </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-zinc-500 italic">No projects found matching search</p>
                    )}
                </div>
            </div>
        </div>
    );
}