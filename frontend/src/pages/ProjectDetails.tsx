import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ProjectDetailes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
            }catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="text-white p-10">Loading projects. </div>
    if (!project) return <div className="text-white p-10">Project not found.</div>

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white mb-6">Back</button>

                <div className="flex justify=between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-blue-500">{project.title}</h1>
                        <p className="text-zinc-400 mt-2">By <span className="text-zinc-200">{project.ownerName}</span></p>
                    </div>  
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm border border-blue-500/20">
                        {project.status}
                    </span>
                </div>
                
                <div className="prose prose-invert max-w-none mb-8">
                    <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {project.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-800 pt-8 ">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-zinc-100">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack?.map((tech: string) => (
                                <span key={tech} className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-lg text-sm text-zinc-300">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-zinc-100">Links</h3>
                        <a href={project.repoUrl} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-xl font-bold transition">
                            View in GitHub
                        </a>
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-center py-3 rounded-xl font-bold border border-zinc-700 transition">
                            Request to Join
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}