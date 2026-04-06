import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FormInput } from "../components/common/FormInput";
import toast from "react-hot-toast";

export default function Login(){
    const navigate = useNavigate();
    const location = useLocation();

    
    const [formData, setFormData] = useState({  email: '', password: ''});
    const [fieldErrors, setFieldError] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState('');
    
    const flashMessage = location.state?.message;

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value});

        if(fieldErrors[field]) {
            setFieldError({ ...fieldErrors, [field]: ''});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setFieldError({});
        setGeneralError('');       

        try{
            const response = await api.post('/auth/login', formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_info', JSON.stringify(response.data.user));

            toast.success("Welcome back!")
            navigate('/dashboard');
        }catch (err: any){
            const responseData = err.response?.data

            if(err.response?.status === 400 && responseData?.errors) {
                const errorMap: Record<string, string> = {};

                Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
                    errorMap[field] = Array.isArray(messages) ? messages[0] :messages;
                });

                setFieldError(errorMap);
            }else{
                setGeneralError(responseData?.message || "Registration Failed. Try again.")
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <form onSubmit={handleSubmit} noValidate className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl border border zinc-800">    
                <h2 className="text3xl font-bold text-blue-500 mb-6">Welcome Back</h2>

                {flashMessage && 
                    <p className="mb-4 text-blue-400 bg-blue-900/20 p-3 rounded-lg text-sm">
                        {flashMessage}
                    </p>
                }

                {generalError && 
                    <p className="mb-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">
                        {generalError}
                        </p>
                    }

                <div className="space-y-4">
                    <FormInput
                        label="Email Address"
                        type="email" 
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={fieldErrors.email}
                    />
                    <FormInput
                        label="Password"
                        type="password" 
                        placeholder="Password"
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={fieldErrors.password}
                    />

                    <button 
                        type="submit" 
                        className="w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-500 transition-colors">
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