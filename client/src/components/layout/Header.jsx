import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
    const { logout } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold text-gray-800">
                Visão Geral
            </h2>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:text-primary transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-gray-600 hover:text-danger transition-colors"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Sair</span>
                </button>
            </div>
        </header>
    );
}
