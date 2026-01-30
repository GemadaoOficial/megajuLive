import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Play, Users, Coins, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function StartLive() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checkingPrereqs, setCheckingPrereqs] = useState(true);
    const [blockReason, setBlockReason] = useState(null);

    useEffect(() => {
        checkPrerequisites();
    }, []);

    const checkPrerequisites = async () => {
        try {
            // 1. Get User Status (to check for bypass)
            const userResponse = await api.get('/auth/me');
            const user = userResponse.data;

            if (user.role === 'ADMIN' || user.skipTutorial) {
                setCheckingPrereqs(false);
                return; // Bypass check
            }

            // 2. Check Modules only if validation is required
            const response = await api.get('/modules');
            const modules = response.data;
            const incomplete = modules.filter(m => !m.completed);

            if (incomplete.length > 0) {
                setBlockReason({
                    type: 'tutorials',
                    message: `Você precisa concluir ${incomplete.length} módulos de treinamento antes de iniciar.`,
                    action: '/tutorials'
                });
            }
        } catch (error) {
            console.error('Erro ao verificar pré-requisitos', error);
        } finally {
            setCheckingPrereqs(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.post('/lives/start', {
                followersStart: parseInt(data.followers),
                coinsStart: parseFloat(data.coins),
                liveLink: data.liveLink || null // Include liveLink in the payload
            });

            navigate(`/live/${response.data.id}/active`);
        } catch (error) {
            console.error('Erro ao iniciar live', error);
            if (error.response?.status === 403) {
                toast.error(error.response.data.message);
                navigate('/tutorials');
            } else {
                toast.error('Erro ao iniciar live. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingPrereqs) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (blockReason) {
        return (
            <div className="max-w-lg mx-auto mt-20 animate-fade-in">
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-10 text-center shadow-2xl overflow-hidden animate-float">
                    {/* Decorative background element inside card */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>

                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse group">
                        <AlertTriangle className="text-orange-600 group-hover:animate-shake transition-transform" size={48} />
                    </div>

                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-3">
                        Treinamento Necessário
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        {blockReason.message} <br />
                        <span className="text-sm text-gray-500 mt-2 block font-medium">Complete os tutoriais para desbloquear as lives.</span>
                    </p>

                    <button
                        onClick={() => navigate(blockReason.action)}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-orange-glow transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                    >
                        <div className="absolute top-0 -left-full w-full h-full bg-white/20 skew-x-[45deg] animate-shine"></div>
                        <span className="relative z-10 flex items-center">
                            Ir para Treinamentos
                            <ArrowRight size={24} className="ml-3 group-hover:translate-x-2 transition-transform" />
                        </span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto animate-fade-in">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Play className="text-primary" size={28} />
                    </div>
                    Iniciar Nova Live
                </h1>
                <p className="text-gray-500">Configure os dados iniciais da sua transmissão</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Seguidores Atuais
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Users size={20} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="number"
                                {...register("followers", { required: "Campo obrigatório", min: 0 })}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 font-medium placeholder-gray-400"
                                placeholder="0"
                            />
                        </div>
                        {errors.followers && <span className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.followers.message}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                            Saldo de Moedas
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Coins size={20} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                {...register("coins", { required: "Campo obrigatório", min: 0 })}
                                className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 font-medium placeholder-gray-400"
                                placeholder="0.00"
                            />
                        </div>
                        {errors.coins && <span className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.coins.message}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-orange-glow transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Iniciando...
                            </>
                        ) : (
                            'Começar Transmissão'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
