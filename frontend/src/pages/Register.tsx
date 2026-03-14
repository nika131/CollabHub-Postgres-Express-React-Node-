import React, { useState } from "react";
import api from "../api/axios";

export default function Register() {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: ''});
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/register', formData);
            console.log("Success:", response.data);
            alert("Account Created successfully!");
        } catch (err: any){
            console.error("Backend Error Details:", err.respose?.data);
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <form onSubmit={handleSubmit} className="w-full max-w-wd rounded_2xl bg_zinc-900 p-8 shadow-2xl border border-zinc_800">
                <h2 className="text-3xl font-bold text-blue-500 mb-6">Create Account</h2>

                {error && <p className="mb-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">{error}</p>}

                <div className="space-y-4">
                    <input 
                    type="text" placeholder="Full Name" 
                    className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:ring-2 focus:rigt-blue-500 transition-all"
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                    <input 
                    type="email" placeholder="Email Address" 
                    className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:ring-2 focus:rigt-blue-500 transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input 
                    type="Password" placeholder="Password" 
                    className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:ring-2 focus:rigt-blue-500 transition-all"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                        Sign Up
                    </button>
                </div>
            </form> 
        </div>
    );
}