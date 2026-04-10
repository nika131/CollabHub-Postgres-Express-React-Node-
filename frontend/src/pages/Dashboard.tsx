import { useEffect, useState } from "react";
import api from "../api/axios";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { ProjectForm } from "../components/dashboard/ProjectForm";
import { ProfileSection } from "../components/dashboard/ProfileSection";
import { IncomingRequests } from "../components/dashboard/IncomingRequests";


export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [isAddingProject, setIsAddingProject] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchProjects();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/me');
            setProfile(res.data);
        }catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects/my/all');
            setProjects(res.data);

        }catch (err) { 
            console.error("Failed to fetch projects", err); 
        }
    }                   



    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8"> 
            <div className="max-w-6xl space-y-12 mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                
                {/* --- 1. PROFILE COMPONENT --- */}
                <ProfileSection
                    profile={profile}
                    onUpdate={fetchProfile}
                />

                {/* --- 2. PROJECTS HEADER --- */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">My Projects</h3>
                        {!isAddingProject && (
                            <button
                                onClick={() => setIsAddingProject(true)}
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition"
                                >+ Add Project
                            </button>
                        )}
                    </div>

                {/* --- 3. ADD PROJECT FORM --- */}
                {isAddingProject && (
                    <ProjectForm 
                        onSuccess={() => {
                            setIsAddingProject(false);
                            fetchProjects();
                        }}
                        onCancel={() => setIsAddingProject(false)}
                    />
                )}

                {/* --- 4. PROJECTS GRID --- */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.length > 0 ?(
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={fetchProjects}
                                showDelete={true}
                            />
                        ))
                    ) : (
                        <p className="text-zinc-500 text-sm italic col-span-2 text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                                You haven't published any projects yet. Time to build something!
                            </p>
                    )}
                    </div>
                </div>

                {/* --- 5. PEOJECT JOIN REQUESTS --- */}
                <div>
                    <IncomingRequests/>
                </div>

            </div>
        </div>
    );
}    