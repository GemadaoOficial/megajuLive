import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
            {/* Background Blobs for Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-pink-200/20 rounded-full blur-[100px]"></div>
            </div>

            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Header is now simpler or integrated, let's keep a minimal one or just padding */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
