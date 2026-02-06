import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, LogOut, Shield } from 'lucide-react';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shadow-xl flex flex-col">
                <div className="p-6 flex items-center justify-center border-b border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <Shield className="text-orange-500" />
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            AGENCY ADMIN
                        </span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/dashboard')
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Visão Geral</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/users')
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Users size={20} />
                        <span className="font-medium">Streamers</span>
                    </Link>

                    <Link
                        to="/admin/modules"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/modules')
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <BookOpen size={20} />
                        <span className="font-medium">Tutoriais</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-orange-500 font-bold border-2 border-slate-600">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">Administrador</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard"
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-2"
                    >
                        <LayoutDashboard size={18} />
                        <span>Voltar ao App</span>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
                    {/* Mobile header placeholder */}
                    <span className="font-bold text-gray-800">Admin Panel</span>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
