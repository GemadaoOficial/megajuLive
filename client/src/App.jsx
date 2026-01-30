import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StartLive from './pages/live/StartLive';
import LiveInProgress from './pages/live/LiveInProgress';
import FinishLive from './pages/live/FinishLive';
import LiveHistory from './pages/live/LiveHistory';
import CollaboratorDashboard from './pages/dashboard/CollaboratorDashboard';
import TutorialHome from './pages/tutorial/TutorialHome';
import ModulePage from './pages/tutorial/ModulePage';
import Profile from './pages/profile/Profile';
import AdminLayout from './components/layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminModules from './pages/admin/AdminModules';

import { Toaster } from 'sonner';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" richColors />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="modules" element={<AdminModules />} />
                    </Route>

                    {/* Streamer Routes */}
                    <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<CollaboratorDashboard />} />
                        <Route path="lives" element={<LiveHistory />} />
                        <Route path="live/start" element={<StartLive />} />
                        <Route path="live/:id/active" element={<LiveInProgress />} />
                        <Route path="live/:id/finish" element={<FinishLive />} />
                        <Route path="tutorials" element={<TutorialHome />} />
                        <Route path="tutorials/:slug" element={<ModulePage />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center text-red-500 font-bold">Acesso Negado</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
