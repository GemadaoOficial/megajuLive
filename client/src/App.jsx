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

import { ToastProvider } from './contexts/ToastContext';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

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
                            {/* Outras rotas virão aqui */}
                        </Route>
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
