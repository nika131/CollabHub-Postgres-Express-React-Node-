import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FormInput } from "../components/common/FormInput";
import toast from "react-hot-toast";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', email: '', password: ''});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [generalErrors, setGeneralErrors] = useState('');

    const handleChnage = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value});

        if (fieldErrors[field]){
            setFieldErrors({ ...fieldErrors, [field]: ''})
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({})
        setGeneralErrors('')

        try {
            await api.post('/auth/register', formData);
            toast.success("Welcome to collabHub")
            navigate('/login');
        } catch (err: any){
            const responseData = err.response?.data

            if(err.response?.status === 400 && responseData?.errors) {
                const errorMap: Record<string, string> = {};

                Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
                    errorMap[field] = Array.isArray(messages) ? messages[0] :messages;
                });

                setFieldErrors(errorMap);
            }else{
                setGeneralErrors(responseData?.message || "Registration Failed. Try again.")
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
            <form onSubmit={handleSubmit} noValidate className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
                <h2 className="text-3xl font-bold text-blue-500 mb-6">Create Account</h2>

                {generalErrors && (
                    <p className="mb-4 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">
                        {generalErrors}
                    </p>
                )}

                <div className="space-y-4">
                    <FormInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleChnage('fullName', e.target.value)}
                        error={fieldErrors.fullName}
                    />

                    <FormInput 
                        label="Email Adress"
                        type="email" 
                        placeholder="john@example.com" 
                        value={formData.email}
                        onChange={(e) => handleChnage('email', e.target.value)}
                        error={fieldErrors.email}
                    />
                    <FormInput
                        label="Password"
                        type="Password"     
                        placeholder="Password" 
                        value={formData.password}
                        onChange={(e) => handleChnage('password', e.target.value)}
                        error={fieldErrors.password}
                    />

                    <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                        Sign Up
                    </button>
                    <p className="mt-6 text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:underline">
                        Sign in
                        </Link>
                    </p>
                </div>
            </form> 
        </div>
    );
}