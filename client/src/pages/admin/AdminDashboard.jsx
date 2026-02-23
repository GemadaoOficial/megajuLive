import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { DollarSign, Video, Users, TrendingUp, Award, Activity, Copy, Shield, Crown, Zap, ArrowRight, BookOpen } from 'lucide-react';
import TiltCard from '../../components/ui/TiltCard';
import PremiumPageHeader from '../../components/ui/PremiumPageHeader';

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
        <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
        </div>
    );

    if (!stats) return <div className="text-center p-10 text-slate-500">Erro ao carregar dados.</div>;

    const { stats: metrics, topStreamers, recentActivity = [] } = stats;

    const getActivityIcon = (type) => {
        switch (type) {
            case 'user': return Users
            case 'live': return Video
            case 'tutorial': return BookOpen
            default: return Activity
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Premium Header */}
            <PremiumPageHeader
                title="Painel Administrativo"
                subtitle="Visão global da agência, controle de streamers e monitoramento em tempo real."
                icon={Shield}
                variant="orange"
                rightContent={
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[120px]">
                            <p className="text-xs text-orange-200 uppercase tracking-widest font-bold mb-1">Status</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="font-bold text-white">Online</span>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                <TiltCard delay={100} color="green" className="bg-white border border-slate-100 p-6 rounded-4xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-xs">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-xs">+12%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Faturamento Total</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">
                        R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </TiltCard>

                <TiltCard delay={200} color="blue" className="bg-white border border-slate-100 p-6 rounded-4xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-xs">
                            <Video size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-xs">
                            {metrics.activeLives} Ao Vivo
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total de Lives</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.totalLives}</p>
                </TiltCard>

                <TiltCard delay={300} color="purple" className="bg-white border border-slate-100 p-6 rounded-4xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shadow-xs">
                            <Users size={24} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Streamers Ativos</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.totalUsers}</p>
                </TiltCard>

                <TiltCard delay={400} color="orange" className="bg-white border border-slate-100 p-6 rounded-4xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-xs">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Engajamento Médio</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tight">{metrics.avgEngagement.toFixed(1)}%</p>
                </TiltCard>
            </div>


            {/* Active Lives Section */}
            {stats.activeLivesList && stats.activeLivesList.length > 0 && (
                <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-[2.5rem] shadow-[#ff57221a] shadow-2xl border border-red-100 p-8 animate-pulse-slow relative overflow-hidden">
                    {/* Dynamic Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
                        </span>
                        <h2 className="text-2xl font-black text-red-600 tracking-tight">Ao Vivo Agora</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {stats.activeLivesList.map((live, idx) => {
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
                                        <div className="w-16 h-16 rounded-full border-[3px] border-red-500 p-0.5 shadow-lg shadow-red-200">
                                            <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                                {live.user.avatar ?
                                                    <img src={live.user.avatar} className="w-full h-full object-cover" /> :
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 bg-slate-100">{live.user.name.charAt(0)}</div>
                                                }
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-linear-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                                            LIVE
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className="font-bold text-slate-900 truncate text-lg group-hover:text-red-600 transition-colors">{live.user.name}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <p className="text-sm font-mono text-slate-600 tabular-nums font-bold">{elapsed}</p>
                                        </div>
                                    </div>
                                </>
                            );

                            return (
                                <TiltCard key={live.id} style={{ animationDelay: `${idx * 100}ms` }} className="h-full">
                                    {live.liveLink ? (
                                        <div className="group relative h-full">
                                            <a
                                                href={live.liveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white border border-red-100/50 p-5 rounded-4xl flex items-center gap-5 shadow-lg hover:shadow-xl transition-all hover:border-red-200 h-full relative overflow-hidden"
                                                title="Clique para assistir"
                                            >
                                                <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                    <Video size={24} className="text-red-500" />
                                                </div>
                                                <CardContent />
                                            </a>
                                            <button
                                                onClick={handleCopyLink}
                                                className="absolute right-4 bottom-4 p-2.5 bg-slate-50 hover:bg-white shadow-md rounded-xl text-slate-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 active:scale-95"
                                                title="Copiar Link"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-red-100 p-5 rounded-4xl flex items-center gap-5 shadow-xs h-full">
                                            <CardContent />
                                        </div>
                                    )}
                                </TiltCard>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Top Streamers Leaderboard */}
                <TiltCard className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                                <Crown size={24} />
                            </div>
                            Top Performance
                        </h2>
                        <button className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors">
                            Ver Todos
                        </button>
                    </div>

                    <div className="space-y-4">
                        {topStreamers.map((streamer, index) => (
                            <div key={streamer.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:scale-[1.01] hover:border-orange-100 transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className={`
                                        w-10 h-10 flex items-center justify-center font-black text-lg rounded-xl shadow-xs
                                        ${index === 0 ? 'bg-linear-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-200 ring-2 ring-yellow-100' :
                                            index === 1 ? 'bg-linear-to-br from-slate-300 to-slate-400 text-white shadow-slate-200' :
                                                index === 2 ? 'bg-linear-to-br from-orange-300 to-orange-400 text-white shadow-orange-200' :
                                                    'bg-white text-slate-400 border border-slate-200'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-xs overflow-hidden">
                                        {streamer.avatar ? <img src={streamer.avatar} className="w-full h-full object-cover" /> : streamer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg group-hover:text-orange-600 transition-colors">{streamer.name}</p>
                                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                            <span className="flex items-center gap-1"><Video size={12} /> {streamer.totalLives} Lives</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-emerald-500">R$ {streamer.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </TiltCard>

                {/* Notifications / Alerts - Span 1 */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[400px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                        <div className="flex items-center gap-3 mb-6 z-10">
                            <Activity className="text-orange-500" />
                            <h3 className="font-bold text-xl">Atividades Recentes</h3>
                        </div>

                        <div className="flex-1 space-y-6 z-10 relative">
                            {recentActivity.length > 0 ? recentActivity.map((activity) => {
                                const Icon = getActivityIcon(activity.type)
                                return (
                                    <div key={activity.id} className="flex gap-4 items-start">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200 leading-snug">
                                                {activity.text}
                                            </p>
                                            <span className="text-xs text-slate-500 font-mono">{activity.time}</span>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <p className="text-sm text-slate-500">Nenhuma atividade recente</p>
                            )}
                        </div>

                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold backdrop-blur-md transition-all text-sm mt-auto border border-white/5">
                            Ver Logs Completos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
