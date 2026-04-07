import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    options: string[];
    placeholder?: string;
    error?: string;
}

export const TagInput = ({ tags, setTags, options, placeholder, error }: TagInputProps) => {
    const [inputValue, SetInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const suggestions = options.filter(opt => 
        opt.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(opt)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addTag = (skill: string) => {
        if (!tags.includes(skill)) {
            setTags([...tags, skill]);
        }
        SetInputValue('');
        setIsOpen(false);
    }
        
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && suggestions.length > 0){
            e.preventDefault();
            addTag(suggestions[0]);
        }else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0){
            setTags(tags.slice(0, -1));
        }
    }

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <div className={`flex flex-wrap gap-2 p-2 bg-zinc-900 border rounded-lg transition-all focus-within:ring-blue-500 ${error ? 'border-red-500' : 'border-zinc-700'}`}>
                {tags.map((tag: string, index: number) => (
                    <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-md border border-blue-500/30">
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== index))} className="hover:text-white ml-1">x</button>
                    </span>
                ))}
                <input  
                    value={inputValue}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        SetInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] text-white"
                />
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-zinc-900 bordeer border-zinc-800 rounded-lg shadow-xl custom-scrollbar">
                    {suggestions.map((skill) => (
                        <li
                            key={skill}
                            onClick={() => addTag(skill)}
                            className="px-4 py-2 text-sm text-zinc-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-color"
                            >{skill}
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="text-red-500 text-[10px] mt-1 italic">{error}</p>}
        </div>
    );
};