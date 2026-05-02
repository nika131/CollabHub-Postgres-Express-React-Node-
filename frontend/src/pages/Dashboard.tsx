import { useEffect, useState } from "react";
import api from "../api/axios";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { ProjectForm } from "../components/dashboard/ProjectForm";
import { ProfileSection } from "../components/dashboard/ProfileSection";
import { IncomingRequests } from "../components/dashboard/IncomingRequests";
import { Loader } from "../components/common/Loader";
import { useParams } from "react-router-dom";


export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [loading, setLoading] = useState(true);
    const [requestTrigger, setRequestTrigger] = useState(0);
    const { userId } = useParams()
    const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');

    useEffect(() => {
        setProfile(null),
        setLoading(true),

        fetchProfile(),
        fetchProjects()
    }, [userId]);

    const refreshAllData = () => {
        fetchProjects(),
        setRequestTrigger(prev => prev + 1) // to trigger refresh in IncomingRequests
    }

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/profiles/${userId}`);
            setProfile(res.data);
        }catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get(`/projects/${userId}/all`);
            setProjects(res.data);

        }catch (err) { 
            console.error("Failed to fetch projects", err); 
        }
        setLoading(false)
    }                   

    const isOwner = String(currentUser.id) === String(userId);


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
                        {isOwner && !isAddingProject &&(
                            <button
                                onClick={() => setIsAddingProject(true)}
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition"
                                >+ Add Project
                            </button>
                        )}
                    </div>

                {/* --- 3. ADD PROJECT FORM --- */}
                {isOwner && isAddingProject &&(
                    <ProjectForm 
                        onSuccess={() => {
                            setIsAddingProject(false);
                            refreshAllData();
                        }}
                        onCancel={() => setIsAddingProject(false)}
                    />
                )}

                {/* --- 4. PROJECTS GRID --- */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!loading ?(
                        projects.length > 0 ?(
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={fetchProjects}
                                showDelete={isOwner}
                            />
                        ))
                        ) : (
                            <p className="text-zinc-500 text-sm italic col-span-2 text-center py-8 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                                    You haven't published any projects yet. Time to build something!
                                </p>
                        )
                    ) : (
                        <div className="col-span-full flex justify-center py-12 w-full">
                            <Loader message="Loading projects"/>
                        </div>
                    )}
                    
                    </div>
                </div>

                {/* --- 5. PEOJECT JOIN REQUESTS --- */}
                <div>
                    {isOwner && (
                        <IncomingRequests key={requestTrigger}/>
                    )}
                </div>

            </div>
        </div>
    );
}    