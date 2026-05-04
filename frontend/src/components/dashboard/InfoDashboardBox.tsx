import { useRef } from "react";
import { Link } from "react-router-dom";

export const InfoDahboardBox = ({projects} : {projects: any[] }) => {

    const renderCount = useRef(0);
    renderCount.current += 1;
    console.log("debuginfodashboared Render:", renderCount.current);

   return (
        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl h-fit">
            <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-4 font-bold">
                Participating Projects
            </h3>
            
            <div className="flex flex-col gap-3">
                {projects && projects.length > 0 ? (
                    projects.map((project: any) => (
                        <div key={project.projectId} className="group flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors" />
                             <Link
                                to={`/projects/${project.projectId}`}
                                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors truncate"
                            >
                                {project.projectTitle}
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-zinc-600 italic">No new project members yet.</p>
                )}
            </div>
        </div>
    );
};
 