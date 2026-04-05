import { useState } from "react";
import type { KeyboardEvent } from "react";

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}

export const TagInput = ({ tags, setTags, placeholder, error }: TagInputProps) => {
    const [inputValue, SetInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && inputValue.trim() !== ''){
            e.preventDefault();
            const newTag = inputValue.trim().replace(/, /g, '');
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            SetInputValue('');
        }else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0){
            setTags(tags.slice(0, -1));
        }
    }

    return (
        <div className="w-full">
            <div className={`flex flex-wrap gap-2 p-2 bg-zinc-900 border rounded-lg transition-all focus-within:ring-blue-500 ${error ? 'border-red-500' : 'border-zinc-700'}`}>
                {tags.map((tag, index) => (
                    <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-md border border-blue-500/30">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== index))} className="hover:text-white ml-1">x</button>
                    </span>
                ))}
                <input  
                    value={inputValue}
                    onChange={(e) => SetInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] text-white"
                />
            </div>
            {error && <p className="text-red-500 text-[10px] mt-1 italic">{error}</p>}
        </div>
    );
};