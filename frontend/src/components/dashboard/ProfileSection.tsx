import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { AvatartUpload } from "./AvatarUpload";
import { TagInput } from "../common/TagInput";
import { TECH_SKILLS } from "../../constants/techSkills";
import { FormInput } from "../common/FormInput";
import { FormTextArea } from "../common/FormTextArea";
import { useParams } from "react-router-dom";

interface ProfileSectionProps {
    profile: any,
    onUpdate: () => void;
}

export const ProfileSection = ({ profile, onUpdate }: ProfileSectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const { userId } = useParams()
    const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        location: '',
        interests: [] as string[],
    });

    useEffect( () => {
        if (profile){
            setFormData({
                fullName: profile.fullName || '',
                 bio: profile.bio || '',
                 location: profile.location || '',
                interests: profile.interests || [] as string[],
            })
        }
    }, [profile]);

    const isOwner = String(currentUser.id) === String(userId);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/profiles', formData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            onUpdate();
        }catch (err: any) { 
            const responseData = err?.response?.data;

            if (err.response?.status === 400 && responseData?.errors) {
                const errorMap: Record<string, string> = {};

                Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
                    if (Array.isArray(messages) && messages.length > 0) {
                        errorMap[field] = messages[0];
                    }else if (typeof messages === 'string') {
                        errorMap[field] = messages;
                    }
                });

                setFieldErrors(errorMap);
            } else {
                console.error("Non-array error recived: ", responseData);

                if (responseData?.message) {
                    toast.error("Erros: " + responseData.message);
                }
            }
        }finally {
            setLoading(false);
        }
    };

    const renderCount = useRef(0);
    renderCount.current += 1;
    console.log("debuginprofilesection Render:", renderCount.current);

    return(
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            {isOwner? 
                (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">My Profile</h2>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={loading}
                            className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition border border-zinc-700">
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>   
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Profile</h2>  
                    </div>
                )
            }

            {isOwner && isEditing ? (
                <div className="space-y-4">
                    <label className="block text-sm text-zinc-500 mb-1">Full Name</label>
                    <FormInput
                        placeholder="full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        error={fieldErrors.fullName}
                        disabled={loading}
                    />
                    <label className="block text-sm text-zinc-500 mb-1">Location</label>
                    <FormInput
                        placeholder="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        error={fieldErrors.location}
                        disabled={loading}
                    />
                    <label className="block text-sm text-zinc-500 mb-1">Bio</label>
                    <FormTextArea
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        error={fieldErrors.bio}
                        disabled={loading}
                    />
                    <label className="block text-sm text-zinc-500 mb-1">Interests</label>
                    <TagInput
                        tags={formData.interests}
                        setTags={(Tags) => setFormData({...formData, interests: Tags})}
                        options={TECH_SKILLS}
                        placeholder="Your interests/skills"
                        error={fieldErrors.interests}
                    />
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
                        <AvatartUpload
                            currentItem={profile?.profilePicUrl}
                            onUpdate={(newUrl) => {
                                setFormData(prev => ({ ...prev, profilePicUrl: newUrl }));    
                            }}
                        />

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