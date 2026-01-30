import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, BookOpen, BarChart2, Settings, Users, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Video, label: 'Minhas Lives', path: '/lives' },
        { icon: BookOpen, label: 'Tutoriais', path: '/tutorials' },
    ];

    // Admin Panel Link (External/New Tab)
    // Admin Panel Link (External/New Tab)
    const adminLink = user?.role === 'ADMIN' ? {
        icon: BarChart2,
        label: 'Painel Administrativo',
        path: '/admin/dashboard',
        external: true
    } : null;

    return (
        <div
            className={`
                relative h-[95vh] my-auto ml-4 rounded-3xl 
                bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl
                transition-all duration-500 ease-in-out z-50
                flex flex-col
                ${collapsed ? 'w-24' : 'w-72'}
            `}
        >
            {/* Logo Section */}
            <div className={`p-8 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} transition-all`}>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xl">S</span>
                </div>
                {!collapsed && (
                    <div className="ml-3 overflow-hidden whitespace-nowrap animate-fade-in">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Shopee<span className="text-primary">Live</span></h1>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden
                            ${isActive
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-glow shadow-lg transform scale-105'
                                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                            }
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <item.icon size={22} className={`shrink-0 transition-transform ${collapsed ? '' : 'mr-4'} group-hover:scale-110`} />

                        {!collapsed && (
                            <span className="font-medium tracking-wide whitespace-nowrap animate-slide-in-right">
                                {item.label}
                            </span>
                        )}

                        {collapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}

                {/* Admin Panel Button (New Tab) */}
                {adminLink && (
                    <a
                        href={adminLink.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden text-orange-600 hover:bg-orange-50 mt-2 border border-orange-100
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <adminLink.icon size={22} className={`shrink-0 transition-transform ${collapsed ? '' : 'mr-4'} group-hover:scale-110`} />
                        {!collapsed && (
                            <span className="font-medium tracking-wide whitespace-nowrap animate-slide-in-right">
                                {adminLink.label}
                            </span>
                        )}
                        {collapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1 bg-orange-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                {adminLink.label}
                            </div>
                        )}
                    </a>
                )}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 mt-auto">
                <div
                    className={`
                        bg-gray-50/50 rounded-2xl p-4 border border-white 
                        flex items-center transition-all duration-300
                        ${collapsed ? 'justify-center flex-col gap-4' : 'justify-between'}
                    `}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{user?.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className={`text-gray-400 hover:text-red-500 transition-colors ${collapsed ? '' : 'ml-2'}`}
                        title="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:scale-110"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </div>
    );
}
