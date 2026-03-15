import { useEffect, useState } from "react";
import api from "../api/axios"

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profiles/me');
                setProfile(response.data);
            }catch (err) {
                console.error("Error fetching profile:", err);
            }finally {
                setLoading(false)
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="text-white bg_zinc-950 min-h-sccreen p-8">Loading CollabHub Profile...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8"></div>
            <h1 className="text-3xl font-bold text-blue-500 mb-2">{profile?.fullname || 'User'}</h1>
            <p className="text-zinc-400 mb-6">{profile?.location || 'Location not set'}</p>
        
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2 text-zinc-200">Bio</h3>
                <p className="text-zinc-400 bg-zinc-800/50 p-4 rounded-lg border-zinc-700">
                    {profile?.bio || "Tell the CollabHub community about yourself..."}
                </p>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-200">Interests</h3>
                <div className="flex flex-wrap gap-2">
                    {profile?.interests?.length > 0 ? (
                        profile.interests.map((interest: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">    
                                {interest}
                            </span>
                        ))
                    ) : (
                        <p className="text-zinc-500 italic text-sm">No interests added yet.</p>
                    )}
                </div>
            </div>
       </div>
    );
}