import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Camera, Edit2 } from 'lucide-react';
import { api } from '../../services/api';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
        } catch (error) {
            console.error("Erro ao carregar perfil", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Header / Cover */}
            <div className="relative h-48 rounded-3xl bg-gradient-to-r from-orange-400 to-red-600 shadow-xl overflow-hidden mb-20 md:mb-12">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>

                <div className="absolute bottom-6 left-6 md:left-10 text-white z-10">
                    <h1 className="text-3xl font-bold">Meu Perfil</h1>
                    <p className="opacity-90">Gerencie suas informações e preferências</p>
                </div>
            </div>

            {/* Profile Content */}
            <div className="px-4 md:px-8">
                <div className="relative -mt-24 md:-mt-20 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                            <User size={64} className="text-gray-400" />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-primary hover:scale-110 transition-all">
                            <Camera size={20} />
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 mt-2">
                            <Shield size={12} className="mr-1" />
                            {user?.role}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="mb-4">
                        <button className="flex items-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            <Edit2 size={18} />
                            <span>Editar Perfil</span>
                        </button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info Card */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b border-gray-100 pb-3">
                            <User className="mr-2 text-primary" size={20} />
                            Informações Pessoais
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Nome Completo</label>
                                <p className="text-lg font-medium text-gray-700">{user?.name}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Corporativo</label>
                                <div className="flex items-center text-lg font-medium text-gray-700">
                                    <Mail size={18} className="mr-2 text-gray-400" />
                                    {user?.email}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status da Conta</label>
                                <span className="inline-flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Ativo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Badges Placeholder */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <Shield size={40} className="text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Emblema de Colaborador</h3>
                        <p className="text-gray-500 max-w-xs">
                            Você é um membro valioso da equipe Shopee Live! Continue realizando lives para desbloquear novas conquistas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
