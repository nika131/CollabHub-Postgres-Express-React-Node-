import api from "../../api/axios"
import toast from "react-hot-toast"
import { Link } from "react-router-dom";

export const ProjectCard = ({ project, onDelete, showDelete = false }: any) => {
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
        <div key={project.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transaction flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <Link to={`/projects/${project.id}`} className="hover:underline">
                        <h4 className="font-bold text-lg text-blue-400">{project.title}</h4>
                    </Link>
                    {showDelete && 
                        <button 
                            onClick={handleDelete} 
                            className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Project"
                            >x
                        </button>
                    }
                </div>

                <p className="text-zinc-500 text-xs mb-2">By s: {project.ownerName || "Anonymous"}</p>
                <p className="text-zinc-400 text-sm line-clamp-3">{project.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                    {project.techStack?.map((tech: string) => (
                        <span key={tech} className="bg-zinc-500/10 px-3 py-1 rounded-full text-[11px] text-zinc-300 border border-zinc-500/20">
                            {tech}
                        </span>
                    ))}
                </div>
                
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                    <a href="{project.repoUrl}" target="_blank" className="text-sm text-blue-500 hover:underline">
                        View Repo
                    </a>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widset">
                        {project.status || 'Active'}
                    </span>
            </div>
        </div>
    );
};