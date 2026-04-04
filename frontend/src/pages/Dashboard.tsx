import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";


export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({title: '', description: '', repoUrl: '', techStack: ''});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

            toast.success("Project launched!")
            setIsAddingProject(false);
            setNewProject({ title: '', description: '', repoUrl: '', techStack: ''});
            fetchProjects();
        }catch(err: any){ 
            if (err.response?.status === 400 && err.response?.data?.console.errors){
                const errorMap: Record<string, string> = {};
                err.response.data.errors.forEach((e: any) => {
                    errorMap[e.path[0]] = e.message;
                });
                setFieldErrors(errorMap);
            }
        }
    }

    const handleDeleteProject = async (id: number) => {
        if (!window.confirm("Are you sure? This action is permanent.")) return;

        try {
            await api.delete(`/projects/${id}`);
            toast.success("Project deleted successfully!");
            fetchProjects();
        } catch (err) { }
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

            toast.success("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        }catch (err) { 
            console.error("Profile update error caught in component: ", err);
        }
    }

    interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
        label?: string;
        error?: string;
    }

    const FormInput = ({ label, error, ...props }: FormInputProps) => (
        <div className="w-full">
            {label && <label className="block text-sm text-zinc-400 mb-1">{label}</label>}
            <input 
                {...props} 
                className={`w-full bg-zinc-900 border rounded-lg p-2 outline-none transition-all focus:ring-1 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-zinc-700'
                }`} 
            />
            {error && <p className="text-red-500 text-[10px] mt-1 italic">{error}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8"> 
            <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-red">My Profile</h2>
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
                                {profile?.fullName ? profile.fullName.charAt(0) : "?"}
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
                        <FormInput
                            placeholder="Project Title"
                            value={newProject.title}
                            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                            error={fieldErrors.title}
                        />
                        <FormInput
                            placeholder="Description"
                            value={newProject.description}
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                            error={fieldErrors.description}
                        />
                        <FormInput
                            placeholder="Github Repo URL"
                            value={newProject.repoUrl}
                            onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                            error={fieldErrors.repoUrl}
                        />
                        <FormInput
                            placeholder="Tech Stack (comma separated: React, Node, ect.)"
                            value={newProject.techStack}
                            onChange={(e) => setNewProject({...newProject, techStack: e.target.value})}
                            error={fieldErrors.techStack}
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
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg text-blue-400">{project.title}</h4>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                        title="Delete Project"
                                        >
                                        X
                                    </button>
                                </div>
                                
                                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{project.description}</p>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.techStack?.map((tech: string) => (
                                    <span key={tech} className="text-[10px] bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                                    {tech}
                                    </span>
                                     ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
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