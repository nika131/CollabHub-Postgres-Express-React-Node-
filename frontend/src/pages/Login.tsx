import React, { useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login(){
    const [formData, setFormData] = useState({  email: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const flashMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();        

        try{
            const response = await api.post('/auth/login', formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));

            navigate('/dashboard');
        }catch (err: any){
            setError(err.response?.data?.message || "Invalid Credentials");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl border border zinc-800">    
                <h2 className="text3xl font-bold text-blue-500 mb-6">Welcome Back</h2>

                {flashMessage && <p className="mb-4 text-blue-400 bg-blue-900/20 p-3 rounded-lg text-sm">{flashMessage}</p>}

                {error && <p className="mb-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">{error}</p>}

                <div className="space-y-4">
                    <input
                        type="email" placeholder="Email Address"
                        className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input
                        type="password" placeholder="Password"
                        className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-500 transition-colors">
                        Login
                    </button>
                    <p className="mt-6 text-center text-sm text-zinc-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-500 hover:underline">
                        sign up for CollabHub
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    )
}