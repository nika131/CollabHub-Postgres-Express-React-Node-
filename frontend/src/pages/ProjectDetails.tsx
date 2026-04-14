import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { JoinRequestButton } from "../components/JoinRequestButton";
import { Loader } from "../components/common/Loader"
import { ProjectForm } from "../components/dashboard/ProjectForm";


export default function ProjectDetailes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');

    useEffect(() => {
        fetchDetails();
    }, [id]);

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

    if (loading) return <Loader message="Decrypting project files..."/>
    if (!project) return <div className="text-white p-10">Project not found.</div>

    const isOwner = currentUser.id === project.ownerId;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white">Back</button>

                    {isOwner && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold border border-zinc-700 transition"
                        >
                            Edit Project
                        </button>
                    )}
                </div>

                <div className="flex justify-between items-start mb-6">
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

                        <div className="flex flex-col gsp-4">
                            <h3 className="text-xl font-semibold text-zinc-100">Open Roles</h3>

                            <div className="flex flex -wrap gap-2 mb-4">
                                {project.roles?.map((role: any) => {
                                    const available = role.seatsTotal - role.seatsFilled;
                                    const isOpen = role.status === 'open' && available > 0;

                                    return isOpen ? (
                                        <span key={role.id} className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            {role.title}
                                            <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                                                {available} open
                                            </span>
                                        </span>
                                    ) : (
                                        <span key={role.id} className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            <del>{role.title}</del>
                                            <span className="text-xs">Filled</span>
                                        </span>
                                    );
                                })}
                            </div>

                            <h3 className="text-xl font-semibold text-zinc-100">Project Links</h3>

                            {/* 1. PUBLIC REPO (Conditional because it is optional) */}
                            {project.repoUrl && (
                                <a href={project.repoUrl} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-xl font-bold transition">
                                View in GitHub
                                </a>
                            )}

                            {/* 2. THE SECURE VAULT (Backend Protected) */}
                            {project.vaultLink && (
                                <a href={project.vaultLink} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-xl font-bold transition">
                                    Join the Discord chat
                                </a>
                            )}
                            
                            {/* 3. PLATFORM ACTIONS */}
                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                {isOwner ? (
                                    <div className="w-full bg-zinc-800/50 text-zinc-400 py-3 rounded-xl text-center border border-zinc-800">
                                        You are owner of this project
                                    </div>
                                ) : (
                                    <JoinRequestButton
                                        projectId={project.id}
                                        initialStatus={project.userStatus || 'none'}
                                        availableRoles={project.roles?.filter((r: any) => r.status === 'open')}
                                    />    
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <ProjectForm
                            initialData={project}
                            projectId={project.id}
                            onSuccess={() => {
                                setIsEditing(false);
                                fetchDetails();
                            }}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                </div>
            )}
        </div>

        
    );
}