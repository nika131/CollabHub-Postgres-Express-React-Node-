import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "../components/NotificationBell";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const verifySession = async () => {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const res = await api.get("/auth/me");
                setUser(res.data);
            }catch (err) {
                setUser(null);
            }
        };

        verifySession();
    }, [location.pathname, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        navigate('/login');
    };

    return (
        <nav className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <Link to="/dashboard" className="text-xl font-bold text-blue-500">CollabHub</Link>
                
                {user && (
                    <div className="flex items-center space-x-6">
                        <Link to="/projects" className="text-zinc-400 hover:text-white transition">Explore</Link>
                        <Link to="/dashboard" className="text-zinc-400 hover:text-white transition">My Profile</Link>
                        
                        <NotificationBell />

                        <button
                            onClick={handleLogout}
                            className="text-sm text-zinc-400 bg-zinc-800 hover:bg-red-900/30 hover:text-red-500 px-4 py-2 rounded-lg"
                            >Logout
                        </button>
                    </div>
                )}
                
            </div>
        </nav>
    );
}