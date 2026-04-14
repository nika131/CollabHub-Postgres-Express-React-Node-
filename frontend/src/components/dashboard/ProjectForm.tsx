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
    initialData?: any;
    projectId?: number | string;  
}

export const ProjectForm = ({ onSuccess, onCancel, initialData, projectId }: ProjectFormProps) => {
    const [loading, setLoading] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const isEditing = !!projectId
    
    const [projectData, setProjectData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        repoUrl: initialData?.repoUrl || '',
        vaultLink: initialData?.vaultLink || '',
        techStack: initialData?.techStack || [] as string[],
        roles: initialData?.roles?.map((r: any) => r.title) || ['']
    });


    const handleSubmit = async () => {
        setFieldErrors({});
        setLoading(true);

        try {
            if (isEditing){
                await api.patch(`/projects/${projectId}`, projectData)
                toast.success("Project updated successfully!");
            }else{
                await api.post('/projects', projectData);
                toast.success("Project launched!")
            }
            
            setProjectData({ title: '', description: '', repoUrl: '', vaultLink: '', techStack: [], roles: []});
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
                value={projectData.title}
                onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                error={fieldErrors.title}
                disabled={loading}
            />            
            <FormTextArea
                placeholder="Description"
                value={projectData.description}
                onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                error={fieldErrors.description}
                disabled={loading}
                rows={4}
            />
            <FormInput
                placeholder="Github Repo URL"
                value={projectData.repoUrl}
                onChange={(e) => setProjectData({...projectData, repoUrl: e.target.value})}
                error={fieldErrors.repoUrl}
                disabled={loading}
            />
            <FormInput
                placeholder="Discord Chat Link"
                value={projectData.vaultLink}
                onChange={(e) => setProjectData({...projectData, vaultLink: e.target.value})}
                error={fieldErrors.vaultLink}
                disabled={loading}
            />
            <TagInput
                tags={projectData.techStack}
                setTags={(tags) => setProjectData({ ...projectData, techStack: tags})}
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex-1 py-2 rounded-lg font-bold transition ${
                        loading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                    }`}

                    >{loading ? "saving..." : isEditing ? "Save Changes" : "Publish Project"}
                </button>
            </div>
        </div>
    );
}

