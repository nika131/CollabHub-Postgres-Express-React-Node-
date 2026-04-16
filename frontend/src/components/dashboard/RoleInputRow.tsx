import { useState, useRef, useEffect } from "react";
import { FormInput } from "../common/FormInput";
import type { KeyboardEvent } from "react";

interface RoleInputRowProps {
    index: number;
    roleTag: string;
    options: string[];
    seatsTotal: number;
    canRemove: boolean;
    disabled: boolean;
    onChange: (index: number, field: 'title' | 'seatsTotal', value: string | number) => void;
    onRemove: (index: number) => void;
}

export const RoleInputRow = ({
    index,
    roleTag,
    options,
    seatsTotal,
    canRemove,
    disabled,
    onChange,
    onRemove
}: RoleInputRowProps) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const suggestions = options.filter(opt => 
        opt.toLowerCase().includes(inputValue.toLowerCase()) &&
        opt !== roleTag
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setInputValue(''); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectRole = (role: string) => {
        onChange(index, 'title', role);
        setInputValue('');
        setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && suggestions.length > 0) {
                selectRole(suggestions[0]);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="flex gap-2 items-start w-full">
            
            <div className="flex-1 relative">
                <div className={`flex w-full p-2 bg-zinc-900 border ${!roleTag && !isOpen ? 'border-red-500/50' : 'border-zinc-700'} rounded-lg transition-all focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[42px]`}>
                    
                    {roleTag && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-md border border-blue-500/30">
                            {roleTag}
                            {!disabled && (
                                <button 
                                    type="button" 
                                    onClick={() => onChange(index, 'title', '')} 
                                    className="hover:text-white ml-2 font-bold"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    )}

                    {!roleTag && (
                        <input 
                            value={inputValue}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setIsOpen(true);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search roles..."
                            disabled={disabled}
                            className="flex-1 bg-transparent outline-none text-sm text-white px-2 py-0.5 w-full"
                        />
                    )}
                </div>

                {isOpen && !roleTag && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl custom-scrollbar">
                        {suggestions.map((role) => (
                            <li
                                key={role}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectRole(role);
                                }}
                                className="px-4 py-2 text-sm text-zinc-300 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"
                            >
                                {role}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="w-24 flex-shrink-0">
                <FormInput
                    placeholder="Qty"
                    type="number"
                    min="1"
                    value={seatsTotal.toString()}
                    onChange={(e) => onChange(index, 'seatsTotal', parseInt(e.target.value) || 1)}
                    disabled={disabled}
                />
            </div>

            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg font-bold transition flex-shrink-0"
                    disabled={disabled}
                >
                    X
                </button>
            )}
        </div>
    );
};