import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

interface ProfileSectionProps {
    profile: any,
    onUpdate: () => void;
}

export const ProfileSection = ({ profile, onUpdate }: ProfileSectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        interests: '',
    });

    useEffect(() => {
        if(profile) {
            setFormData({
                bio: profile.bio || '',
                location: profile.location || '',
                interests: profile.interests?.join(', ') || ''
            });
        }
    }, [profile])

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                interests: formData.interests
                    .split(',')
                    .map(i => i.trim())
                    .filter(i => i !== '')
            };
            await api.put('/profiles', payload);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            onUpdate();
        }catch (err) { 
            console.error("Profile update error: ", err);
        }finally {
            setLoading(false);
        }
    };

    return(
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={loading}
                    className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition border border-zinc-700">
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
                            rows={3}
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
                            placeholder="React, Node.js, etc."
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-bold transition"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            ) : ( 
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center text-2xl font-bold">
                            {profile?.fullName ? profile.fullName.charAt(0) : "?"}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
                            <p className="text-zinc-500">{profile?.location || 'Unknown Location'}</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-zinc-400 text-sm uppercase tracking-wider mb-2">About</h4>
                        <p className="text-zinc-300 leading-relaxed">
                            {profile?.bio || "No bio set yet. Tell the world who you are!"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {profile?.interests?.length > 0 ? (
                            profile?.interests?.map((interest: string) => (
                                <span key={interest} className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-blue-400 border border-zinc-700">
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <span className="text-zinc-600 text-xs italic">No interests listed</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 