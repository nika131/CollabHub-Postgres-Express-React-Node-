import api from "../../api/axios"
import toast from "react-hot-toast"

export const ProjectCard = ({ project, onDelete }: any) => {
     const handleDelete = async () => {
        if (!window.confirm("Are you sure? This action is permanent.")) return;

        try {
            await api.delete(`/projects/${project.id}`);
            toast.success("Project deleted successfully!");
            onDelete();
        } catch (err) { 

        }
    };

    return (
        <div className="bg-zinc-900 border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-blue-400">{project.title}</h4>
                <button onClick={handleDelete} className="text-zinc-600 hover:text-red-500 transition-colors">x</button>
            </div>
            <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {project.techStack?.map((tech: string) => (
                    <span key={tech} className="text-[10px] bg-zinc-800 px-3 py-1 rounded border border-zinc-700">{tech}</span>
                ))}
            </div>
        </div>
    );
};