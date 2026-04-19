import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Bell } from 'lucide-react';
import { socket } from "../api/socket";
import toast from "react-hot-toast";

interface Notification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const drowpdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try{
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const userData = localStorage.getItem('user_info');
    const currentUser = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        if (!currentUser?.id) return;

        socket.connect();

        socket.emit("register", currentUser.id)

        socket.on("new_notification", (data) => {
            toast(data.message, {
                style: {borderRadius: '10px', background: '#333', color: '#fff'}
            });
            setUnreadCount(prev => prev + 1)
            setNotifications(perv => [{ ...data, id: Date.now() }, ...perv])
        });

        return () => {
            socket.off("new_notification");
            socket.disconnect();
        };
    }, [currentUser?.id]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drowpdownRef.current && !drowpdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleDropdown = async () => {
        setIsOpen(!isOpen);

        if (!isOpen && unreadCount > 0) {
            try {
                await api.patch('/notifications/read');
                setUnreadCount(0);

                setNotifications(prev => prev.map(n => ({ ...n, isRead: true})));
            } catch (err) {
                console.error("Failed to mark read", err);
            }
        }
    };

    return (
        <div className="relative" ref={drowpdownRef}>
            <button
                onClick={handleToggleDropdown}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
            >   <span className="text-xl">
                    <Bell color="white" size={36}/>
                </span>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex itmes-center justify-center font-bold shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-zinc-500">
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={(notif.id)}
                                    className={`p-4 border-b border-zinc-800/50 transition-colors ${notif.isRead ? 'bg-transparent ocacity-75' : 'bg-blue-900/10'}`}
                                >
                                    <p className="text-sm text-zinc-200">{notif.message}</p>
                                    <p className="text-[10px] text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};