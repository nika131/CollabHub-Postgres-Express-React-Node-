import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

interface JoinButtonProps {
    projectId: string;
    initialStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
    availableRoles?: string[];
}

export const JoinRequestButton = ({ projectId, initialStatus = 'none', availableRoles}: JoinButtonProps) => {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleJoinRequest = async () => {
        setLoading(true);

        try{
            await api.post(`/projects/${projectId}/join`);
            setStatus('pending');
            toast.success("Request sent to project owner!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send request");
        } finally {
            setLoading(false);
        }
    };

    if (status === 'accepted') {
        return (
            <div className="bg-green-500/10 text-green-400 border border-green-500/20 py-3 rounded-xl font-bold text-center">
                Member of Team
            </div>
        );
    }

    if (status === 'pending') {
        return(
            <button disabled className="w-full bg-zinc-800 text-zinc-500 py-3 rounded-xl font-bold border-zinc-700 cursor-not-allowed">
                Request Pending...
            </button>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-bold text-center">
                Application Declined
            </div>
        );
    }

    return (
        <button
            onClick={handleJoinRequest}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98]"
            >{loading ? "Sending..." : "Request to Join"}
        </button>
    );
};