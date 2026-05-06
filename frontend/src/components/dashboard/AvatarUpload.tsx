import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

interface AvatarUploadProps {
    currentItem: string | null | undefined;
    onUpdate: (newUrl: string) => void;
}

export const AvatartUpload = ({ currentItem, onUpdate }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.patch('/profiles/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate(res.data.profilePicUrl);
            toast.success("Avatar updated!");
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="relative group w-24 h-24">
            <img 
                src={currentItem || 'https://via.placeholder.com/150'} 
                className="w-full h-full rounded-full object-cover border-2 border-zinc-800"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition">
                <span className="text-xs font-bold">{uploading ? '...' : 'Edit'}</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
        </div>
    );
}