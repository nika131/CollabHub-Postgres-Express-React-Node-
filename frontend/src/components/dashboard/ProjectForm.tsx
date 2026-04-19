import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { FormInput } from "../common/FormInput";
import { TagInput } from "../common/TagInput";
import { TECH_SKILLS } from "../../constants/techSkills";
import { FormTextArea } from "../common/FormTextArea";
import { RoleInputRow } from "./RoleInputRow";
import { ROLE_OPTIONS } from "../../constants/techSkills";

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
    
    const [projectData, setProjectData] = useState<{
        title: string;
        description: string;
        repoUrl: string;
        vaultLink: string;
        status: string;
        techStack: string[];
        roles: { title: string; seatsTotal: number }[];
    }>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        repoUrl: initialData?.repoUrl || '',
        vaultLink: initialData?.vaultLink || '',
        status: initialData?.status || 'active',
        techStack: initialData?.techStack || [] as string[],
        roles: initialData?.roles?.map((r: any) => ({ 
            id: r.id,
            title: r.title, 
            seatsTotal: r.seatsTotal 
        })) || [{ title: '', seatsTotal: 1 }]
    });

    const handleRoleChange = (index: number, field: 'title' | 'seatsTotal', value: string | number) => {
        const newRoles = [...projectData.roles];
        newRoles[index] = { ...newRoles[index], [field]: value };
        setProjectData({ ...projectData, roles: newRoles });
    };

    const handleAddRole = () => {
        setProjectData({ ...projectData, roles: [...projectData.roles, { title: '', seatsTotal: 1 }] });
    };

    const handleRemoveRole = (index: number) => {
        if (projectData.roles.length === 1) return; 
        const newRoles = projectData.roles.filter((_, i) => i !== index);
        setProjectData({ ...projectData, roles: newRoles });
    };


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
            
            setProjectData({ title: '', description: '', repoUrl: '', vaultLink: '', status: '', techStack: [], roles: []});
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

            <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-zinc-300 ml-1">Project Status</label>
                <select 
                    value={projectData.status}
                    onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
                    disabled={loading}
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                    <option value="active">Active</option>
                    <option value="looking-for-collab">looking for collab</option>
                    <option value="closed">Closed</option>
                </select>
                {fieldErrors.status && <p className="text-reed-500 text-xs font-bold">{fieldErrors.status}</p>}
            </div>
            <TagInput
                tags={projectData.techStack}
                setTags={(tags) => setProjectData({ ...projectData, techStack: tags})}
                options={TECH_SKILLS}
                placeholder="Tech Stack (Type and press enter)"
                error={fieldErrors.techStack}
            />
            <div className="space-y-3 pt-4 border-t border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-zinc-300">Open Roles (Seats to Fill)</h4>
                    <button
                        type="button"
                        onClick={handleAddRole}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-white font-bold transition"
                        disabled={loading}
                    >
                        + Add Role
                    </button>
                </div>

                {projectData.roles.map((role, index) => (
                    <RoleInputRow
                        key={index}
                        index={index}
                        roleTag={role.title}
                        options={ROLE_OPTIONS}
                        seatsTotal={role.seatsTotal}
                        canRemove={projectData.roles.length > 1}
                        disabled={loading}
                        onChange={handleRoleChange}
                        onRemove={handleRemoveRole}
                    />
                ))}

                {fieldErrors.roles && <p className="text-red-500 text-xs font-bold">{fieldErrors.roles}</p>}
            </div>
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

