import { useEffect, useState } from "react";
import api from "../api/axios"

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        interests: '',
    })

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profiles/me');
            setProfile(res.data);
            setFormData({
                bio: res.data.bio || '',
                location: res.data.location || '',
                interests: res.data.interests?.join(', ') || '',                });
        }catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                interests: formData.interests.split(',').map(i => i.trim()).filter(i => i !== '')
            };
            await api.put('/profiles', payload);
            setIsEditing(false);
            fetchProfile();
        }catch (err) { alert("Update failed"); }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8"> 
            <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-sm bg-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition">
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Location</label>
                            <input 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g. Tbilisi, Georgia" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-500 mb-1">Interests</label>
                            <textarea 
                                value={formData.interests}
                                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                placeholder="React, Node.js, Open Source, etc.(comma separated)"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-bold transition"
                        >
                            Save Changes
                        </button>
                    </div>
                ) : ( 
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center text-2xl font-bold">
                                {profile?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
                                <p className="text-zinc-500">{profile?.location || 'Earth'}</p>
                            </div>
                            <div>
                                <h4 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">About</h4>
                                <p className="text-zinc-200">{profile?.bio || "No bio set yet."}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile?.interests?.map((i: string) => (
                                    <span key={i} className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-blue-400 border border-zinc-700">
                                        {i}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>    
                )}
            </div>
        </div>
    );
}