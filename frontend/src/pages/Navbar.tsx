import { Link, useNavigate } from "react-router-dom";
import { Bell } from 'lucide-react';
import { useState } from "react";

export default function Navbar() {
    const [unreadCount, setUnreadCount] = useState(0);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        navigate('/login');
    };

    return (
        <nav className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-xl font-bold text-blue-500">CollabHub</Link>
                
                {token && (
                    <div className="flex items-center space-x-6">
                        <Link to="/projects" className="text-zinc-400 hover:text-white transition">Explore</Link>
                        <Link to="/dashboard" className="text-zinc-400 hover:text-white transition">My Profile</Link>
                        <button
                        onClick={handleLogout}
                        className="text-sm text-zinc-400 bg-zinc-800 hover:bg-red-900/30 hover:text-red-500 px-4 py-2 rounded-lg"
                        >Logout
                        </button>
                        <div className="relative cursor-pointer hover:text-blue-500 transition">
                            <span className="text-xl"><Bell color="white" size={48}/></span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 br-red-500 text-[10px] rounded-full flex items-center font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                )};
                
            </div>
        </nav>
    );
}