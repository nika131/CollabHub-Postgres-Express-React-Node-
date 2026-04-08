import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const IncomingRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/projects/requests/incoming');
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRespond = async (applicationId: number, status: 'accepted' | 'rejected') => {
        try {
            await api.patch(`/projects/requests/${applicationId}`, { status });
            toast.success(`Request ${status}!`);
            setRequests(requests.filter(req => req.applicationId !== applicationId));
        } catch (err) {
            toast.error("Failed to update request");
        }
    };

    if (loading) return <div className="text-zinc-500 animate-pulse"> Loading requests... </div>;
    if (requests.length === 0) {
        return (
            <div className="bf-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 italic">
                No pending requests right now.
            </div>
        );
    }


    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Incoming Requests ({requests.length})</h3>
            {requests.map((req) => (
                <div key={req.applicationId} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-zinc-700 transition">
                    <div>
                        <p className="text-white font-semibold">
                            <span className="text-blue-400">{req.applicantName}</span> wants to join
                        </p>
                        <p className="text-sm text-zinc-400 font-bold mt-1">Project: {req.projectTitle}</p>
                        <p className="text-sm text-zinc-600 mt-1">Applied: {new Date(req.CreatedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => handleRespond(req.applicationId, 'rejected')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rouneded-lg font-bold transition text-sm"
                            >Decline
                        </button>
                        <button
                            onClick={() => handleRespond(req.applicationId, 'accepted')}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition text-sm"
                            >Accept 
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};