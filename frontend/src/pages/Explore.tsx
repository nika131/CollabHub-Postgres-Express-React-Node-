import { useEffect, useState } from "react";
import api from "../api/axios";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { Loader } from "../components/common/Loader";

export default function Explore() {
    const [projects, setProjects ] = useState<any[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);


    const fetchInitialProjects = async (query= "") => {
        setLoading(true);
        try {
            //const safeSearchTerm = encodeURIComponent(search);
            const res = await api.get(`/projects/all?search=${query}&limit=10`);
            setProjects(res.data.data);
            setNextCursor(res.data.nextCursor); 
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreProjects = async () => {
        if (!nextCursor || fetchingMore) return;
        setFetchingMore(true);

        try {
            const res = await api.get(`/projects/all?limit=10&cursor=${nextCursor}`);

            setProjects(prev => [...prev, ...res.data.data]);
            setNextCursor(res.data.nextCursor);
        } catch (err) {
            console.error("Failed to fetch more projects", err);
        } finally {
            setFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialProjects(searchQuery);
    }, [searchQuery]);
   

    const handleProjectDeleted = (deleteProjectId: number) => {
        setProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== deleteProjectId)
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-blue-500">Explore Projects</h1>

                    <input 
                        type="text"
                        placeholder="Search by title or tech (e.g. React)..."
                        value={searchQuery}
                        className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={(e) => setSearchQuery(e.target.value)}  
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading ?(
                        projects.length > 0 ? (
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDelete={handleProjectDeleted}
                            />
                        ))
                        ) : (
                            <p className="text-zinc-500 italic">No projects found matching search</p>
                        )
                    ) : (
                        <div className="col-span-full flex justify-center py-12 w-full">
                            <Loader message="Loading projects"/>
                        </div>
                    )}
                    

                    {nextCursor && (
                        <div className="flex justify-center mt-12 mb-8">
                            <button
                                onClick={fetchMoreProjects}
                                disabled={fetchingMore}
                                className="bg-zinc-800 hoverbg-zinc-700 text-white px-8 py-3 rounded-full font-bold transition border border-zinc-700 disabled:opacity-50"
                            >
                                {fetchingMore ? "Loading..." : "Load More Projects"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}