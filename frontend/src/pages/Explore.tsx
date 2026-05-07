import { useEffect, useState } from "react";
import api from "../api/axios";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { Loader } from "../components/common/Loader";
import { useDebounce } from "../hooks/useDebounce";

export default function Explore() {
    const [projects, setProjects ] = useState<any[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'recommended'>('all');
    const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    const fetchInitialProjects = async (query= "", mode = viewMode) => {
        setLoading(true);
        setEmptyMessage(null);
        try {
            const endPoint = mode === 'recommended' ? '/projects/recommended' : '/projects/all';

            //const safeSearchTerm = encodeURIComponent(search);
            const res = await api.get(`${endPoint}?search=${query}&limit=10`);
            setProjects(res.data.data || []);
            setNextCursor(res.data.nextCursor || null);
            
            if (res.data.message) {
                setEmptyMessage(res.data.message);
            }
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
            const endPoint = viewMode === 'recommended' ? '/projects/recommended' : '/projects/all';
            const res = await api.get(`${endPoint}?search=${debouncedSearchTerm}&limit=10&cursor=${nextCursor}`);

            setProjects(prev => [...prev, ...(res.data.data || [])]);
            setNextCursor(res.data.nextCursor);
        } catch (err) {
            console.error("Failed to fetch more projects", err);
        } finally {
            setFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialProjects(debouncedSearchTerm, viewMode);
    }, [debouncedSearchTerm, viewMode]);
   

    const handleProjectDeleted = (deleteProjectId: number) => {
        setProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== deleteProjectId)
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header & Toggle Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <h1 className="text-3xl font-bold text-blue-500">Explore Projects</h1>

                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                                    viewMode === 'all' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                global
                            </button>
                            <button
                                onClick={() => setViewMode('recommended')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-2${
                                    viewMode === 'recommended' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                For you
                            </button>
                        </div>
                    </div>

                    <input 
                        type="text"
                        placeholder="Search by title or tech (e.g. React)..."
                        value={searchQuery}
                        className="w-full md:w-96 bg-zinc-900 border border-zinc-800 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                        onChange={(e) => setSearchQuery(e.target.value)}  
                    />
                </div>

                {/* Empty State Message for Recommendations */}
                {emptyMessage && viewMode === 'recommended' && (
                    <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl text-center mb-6">
                        <p className="text-blue-500 font-bold">{emptyMessage}</p>
                    </div>
                )}


                {/* Project Grid */}
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
                    
                    {/* Pagination Button */}
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