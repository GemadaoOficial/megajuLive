import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { DollarSign, Video, Users, TrendingUp, Award, Activity, Copy } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!stats) return <div>Erro ao carregar dados.</div>;

    const { stats: metrics, topStreamers } = stats;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Visão Geral da Agência</h1>
                <p className="text-gray-500 mt-1">Acompanhe o desempenho global do seu time de streamers.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Faturamento Total</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Video size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {metrics.activeLives} Ao Vivo
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total de Lives</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalLives}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Users size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Streamers Ativos</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalUsers}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Engajamento Médio</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgEngagement.toFixed(1)}%</p>
                </div>
            </div>


            {/* Active Lives Section */}
            {stats.activeLivesList && stats.activeLivesList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 animate-pulse-slow">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <h2 className="text-lg font-bold text-red-600">Ao Vivo Agora</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.activeLivesList.map(live => {
                            const handleCopyLink = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(live.liveLink);
                                alert('Link copiado!');
                            };

                            const startedAt = new Date(live.startedAt);
                            const now = new Date();
                            const diffMs = now - startedAt;
                            const diffMins = Math.floor(diffMs / (1000 * 60));
                            const hours = Math.floor(diffMins / 60);
                            const minutes = diffMins % 60;
                            const elapsed = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

                            const CardContent = () => (
                                <>
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full border-2 border-red-500 p-0.5">
                                            <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                                                {live.user.avatar ?
                                                    <img src={live.user.avatar} className="w-full h-full object-cover" /> :
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{live.user.name.charAt(0)}</div>
                                                }
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            LIVE
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{live.user.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <p className="text-sm font-mono text-gray-600 tabular-nums">{elapsed}</p>
                                        </div>
                                    </div>
                                </>
                            );

                            if (live.liveLink) {
                                return (
                                    <div key={live.id} className="group relative">
                                        <a
                                            href={live.liveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white border border-red-100 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:border-red-300 cursor-pointer block"
                                            title="Clique para assistir"
                                        >
                                            <CardContent />
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 mr-8">
                                                <Video size={20} />
                                            </div>
                                        </a>
                                        <button
                                            onClick={handleCopyLink}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white shadow-md rounded-full text-gray-500 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                                            title="Copiar Link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <div key={live.id} className="bg-white border border-red-100 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Streamers Leaderboard */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Award className="text-yellow-500" /> Top Performance
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {topStreamers.map((streamer, index) => (
                            <div key={streamer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                        {streamer.avatar ? <img src={streamer.avatar} className="w-full h-full rounded-full" /> : streamer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{streamer.name}</p>
                                        <p className="text-xs text-gray-500">Streamer Pro</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">R$ {streamer.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-xs text-green-600 font-medium">Receita Gerada</p>
                                </div>
                            </div>
                        ))}
                        {topStreamers.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Nenhum dado de performance ainda.</p>
                        )}
                    </div>
                </div>

                {/* Activity Feed / Notes */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 text-white">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Activity className="text-green-400" /> Status do Sistema
                    </h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse"></div>
                            <div>
                                <p className="font-medium text-slate-200">Servidor Operacional</p>
                                <p className="text-xs text-slate-400">Uptime: 99.9%</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="font-medium text-slate-200">IA de Análise</p>
                                <p className="text-xs text-slate-400">Pronto para processar prints</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700 mt-4">
                            <p className="text-sm text-slate-400 mb-2">Dica do dia:</p>
                            <p className="italic text-slate-300">"Verifique os relatórios de engajamento para ajustar os horários das lives."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
