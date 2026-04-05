import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const FormInput = ({ label, error, ...props}: FormInputProps) => (
    <div className="w-full">
        {label && <label className="block text-sm text-zinc-400 mb-1">{label}</label>}
        <input 
            {...props}
            className={`w-full bg-zinc-900 border rounded-lg p-2 outline-none transition-all focus:ring-1 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-zinc-700' 
            }`}
        />
        {error && <p className="text-red-500 text-[10px] mt-1 italic">{error}</p>}
    </div>
)