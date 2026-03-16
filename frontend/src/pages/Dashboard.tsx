import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({title: '', description: '', repoUrl: '', techStack: ''});

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects/my/all');
            setProjects(res.data);

        }catch (err) { console.error("FAiled to fetch projects", err); }
    }

    const handleAddProject = async () => {
        try {
            const payload = {
                ...newProject,
                techStack: newProject.techStack.split(',').map(s => s.trim())
            };
            await api.post('/projects', payload);
            setIsAddingProject(false);
            setNewProject({ title: '', description: '', repoUrl: '', techStack: ''});
            fetchProjects();
        }catch(err){ alert("Project upload failed"); }
    }

    const handleDeleteProject = async (id: number) => {
        if (!window.confirm("Delete this project?")) return;

        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        } catch (err) {
            alert("Delete Failed")
        }
    };

    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        interests: '',
    })

    useEffect(() => {
        fetchProfile();
        fetchProjects();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/me');
            setProfile(res.data);
            setFormData({
                bio: res.data.bio || '',
                location: res.data.location || '',
                interests: res.data.interests?.join(', ') || '',                });
        }catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                interests: formData.interests.split(',').map(i => i.trim()).filter(i => i !== '')
            };
            await api.put('/profiles', payload);
            setIsEditing(false);
            fetchProfile();
        }catch (err) { alert("Update failed"); }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8"> 
            <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm bg-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition">
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Location</label>
                            <input 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Tbilisi, Georgia" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Interests</label>
                            <textarea 
                                value={formData.interests}
                                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="React, Node.js, Open Source, etc.(comma separated)"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-bold transition"
                        >
                            Save Changes
                        </button>
                    </div>
                ) : ( 
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center text-2xl font-bold">
                                {profile?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
                                <p className="text-zinc-500">{profile?.location || 'Earth'}</p>
                            </div>
                        </div>
                        
                            <div>
                                <h4 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">About</h4>
                                <p className="text-zinc-200">{profile?.bio || "No bio set yet."}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile?.interests?.map((i: string) => (
                                    <span key={i} className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-blue-400 border border-zinc-700">
                                        {i}
                                    </span>
                                ))}
                            </div>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">My Projects</h3>
                    <button
                        onClick={() => setIsAddingProject(!isAddingProject)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition"
                        >{isAddingProject ? 'Cancel' : '+ Add Project'}
                    </button>
                </div>

                {isAddingProject && (
                    <div className="bg-zinc-800 p-4 rounded-xl mb-8 space-y-4 border border-zinc-700">
                        <input  
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 focus:outline-none"
                        />
                        <textarea 
                        placeholder="Description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 h-20"
                        />
                        <input  
                        placeholder="Github Repo URL"
                        value={newProject.repoUrl}
                        onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2"
                        />
                        <input  
                        placeholder="Tech Stack (comma separated: React, Node, ect.)"
                        value={newProject.techStack}
                        onChange={(e) => setNewProject({...newProject, techStack: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2"
                        />
                        <button
                        onClick={handleAddProject}
                         className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold"
                        >Publish Project
                        </button>
                    </div>
                )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.length > 0 ?(
                        projects.map((project) => (
                            <div key={project.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-blue text-blue-400">{project.title}</h4>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="text-zinc600 hover:text-red-500 transition-colors p-1"
                                            title="Delete Project"
                                            >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18m-2 1-1 2-2 2h7c 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.techStack?.map((tech: string) => (
                                    <span key={tech} className="text-[10px] bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                                    {tech}
                                    </span>
                                     ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center"></div>
                                    {project.repoUrl ? (
                                    <a 
                                        href={project.repoUrl} 
                                        target="_blank" 
                                        className="text-blue-400 hover:underline text-sm"
                                    >
                                        View Code
                                    </a>
                                    ) : (
                                    <span className="text-[10px] text-zinc-700 italic">No repo link</span>
                                    )}
                                </div>
                        ))
                    ) : (
                        <p className="text-zinc-500 text-sm italic">You haven't added any projects yet.</p>
                    )}
                    </div>
                </div>
            </div>
    );
}    