import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FormInput } from "../common/FormInput";
import { TagInput } from "../common/TagInput";
import { TECH_SKILLS } from "../../constants/techSkills";
import { FormTextArea } from "../common/FormTextArea";

interface ProjectFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const ProjectForm = ({ onSuccess, onCancel }: ProjectFormProps) => {
    const [loading, setLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        repoUrl: '',
        techStack: [] as string[]
    });


    const handleAddProject = async () => {
        setFieldErrors({});
        setLoading(true);

        try {
            await api.post('/projects', newProject);
 
            toast.success("Project launched!")
            setNewProject({ title: '', description: '', repoUrl: '', techStack: []});
            onSuccess();
        }catch(err: any){ 
            const responseData = err.response?.data;

            if (err.response?.status === 400 && responseData?.errors){
                const errorMap: Record<string, string> = {};
                
                Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        errorMap[field] = messages[0];
                    } else if (typeof messages === 'string') {
                        errorMap[field] = messages;
                    }
                });

                setFieldErrors(errorMap);
            } else {
                console.error("Non-array error recived: ", responseData);

                if (responseData?.message) {
                    toast.error("Error: " + responseData.message);
                }
            }
        }finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-800 p-4 rounded-xl mb-8 space-y-4 border border-zinc-700 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-white mb-2">Create New project</h3>

            <FormInput
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                error={fieldErrors.title}
                disabled={loading}
            />            
            <FormTextArea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                error={fieldErrors.description}
                disabled={loading}
                rows={4}
            />
            <FormInput
                placeholder="Github Repo URL"
                value={newProject.repoUrl}
                onChange={(e) => setNewProject({...newProject, repoUrl: e.target.value})}
                error={fieldErrors.repoUrl}
                disabled={loading}
            />
            <TagInput
                tags={newProject.techStack}
                setTags={(tags) => setNewProject({ ...newProject, techStack: tags})}
                options={TECH_SKILLS}
                placeholder="Tech Stack (Type and press enter)"
                error={fieldErrors.techStack}
            />
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-lg font-bold transition"
                    disabled={loading}
                >Cancel
                </button>
                <button
                    onClick={handleAddProject}
                    disabled={loading}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${
                        loading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                    }`}
                >{loading ? "Publishing..." : "Publish Project"}
                </button>
            </div>
        </div>
    );
}

