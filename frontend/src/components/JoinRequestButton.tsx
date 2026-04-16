import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

interface Role {
    id: number;
    title: string;
    seatsTotal: number;
    seatsFilled: number;
    status: string;
}

interface JoinButtonProps {
    projectId: number | string;
    initialStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
    availableRoles?: Role[];
}

export const JoinRequestButton = ({ projectId, initialStatus = 'none', availableRoles = []}: JoinButtonProps) => {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const handleJoinRequest = async () => {
        if (!selectedRoleId) return toast.error("Please select role");
        setLoading(true);

        try{
            await api.post(`/applications/${projectId}/join`, {
                roleId: selectedRoleId
            });
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

    if (availableRoles?.length === 0) {
        return (
            <div className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-bold text-center">
                No Open Roles Available
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98]"
            >
                Request to Join Project
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-2">Select Your Role </h3>
                        <p className="text-zinc-400 text-sm mb-6">Choose the specific seat your are applying for</p>

                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar mb-6">
                            {availableRoles.map((role) => (
                                <label 
                                    key={role.id}
                                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedRoleId === role.id 
                                        ? 'bg-blue-600/20 border-blue-500'
                                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                                    } `}
                                >
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="radio"
                                            name="roleSelection"
                                            value={role.id}
                                            checked={selectedRoleId === role.id}
                                            onChange={() => setSelectedRoleId(role.id)}
                                            className="w-4 h-4 text-blue-600 bg-zinc-900 border-zinc-700 focus:ring-offset-zinc-900"    
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{role.title}</span>
                                            <span className="text-xs text-blue-400 mt-1">
                                                {role.seatsTotal - role.seatsFilled} seat(s) remaining
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-zinc-800">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={loading}
                                className="flex-1 bg-zinc-800 hover-bg-zinc-700 text-white py-2 rounded-lg font-bold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleJoinRequest}
                                disabled={loading || !selectedRoleId}
                                className={`flex-1 py-2 rounded-lg font-bold transition ${
                                    loading || !selectedRoleId
                                    ? 'bg-blue-800 cursor-not-allowed opacity-50'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                            >
                                {loading ? 'sending...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
        
    );
};