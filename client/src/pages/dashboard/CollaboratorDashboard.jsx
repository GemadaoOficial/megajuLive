import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import { DollarSign, Video, Users, TrendingUp, Calendar, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CollaboratorDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/analytics/my-stats');
            setStats(response.data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { summary, recentLives } = stats || { summary: {}, recentLives: [] };

    // Format data for chart (reversed to show chronological order left-to-right)
    const chartData = [...recentLives].reverse().map(live => ({
        name: new Date(live.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receita: live.revenue || 0,
        investimento: live.coinsSpent || 0,
    }));

    return (
        <div className="space-y-8 animate-fade-in p-2">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
                <p className="text-gray-500">Bem-vindo de volta! Aqui está o resumo das suas lives.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Receita Total"
                    value={`R$ ${summary.totalRevenue?.toFixed(2) || '0.00'}`}
                    icon={DollarSign}
                    color="green"
                    trend="up"
                    trendValue="+12%" // Simulado por enquanto
                />
                <StatCard
                    title="Total de Lives"
                    value={summary.totalLives || 0}
                    icon={Video}
                    color="orange"
                />
                <StatCard
                    title="Seguidores Ganhos"
                    value={`+${summary.totalFollowersGained || 0}`}
                    icon={Users}
                    color="blue"
                    trend="up"
                    trendValue="+5%"
                />
                <StatCard
                    title="ROI Médio"
                    value={`${summary.averageROI?.toFixed(1) || 0}%`}
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-primary" size={20} />
                        Performance Recente
                    </h2>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="receita" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Receita (R$)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <TrendingUp size={48} className="mb-2 opacity-50" />
                                <p>Nenhum dado de live recente</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Calendar className="mr-2 text-blue-500" size={20} />
                        Histórico Recente
                    </h2>
                    <div className="space-y-4">
                        {recentLives.length > 0 ? (
                            recentLives.map((live) => (
                                <div key={live.id} className="flex items-center justify-between p-3 hover:bg-white/60 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                            <Video size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{live.title || "Live Shopee"}</p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Clock size={10} className="mr-1" />
                                                {new Date(live.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-green-600 text-sm">
                                            +R$ {live.revenue?.toFixed(2) || '0.00'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {live.duration ? `${Math.round(live.duration / 60)} min` : 'Finalizada'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8">Nenhuma live encontrada.</p>
                        )}
                    </div>

                    <button className="w-full mt-6 py-2 text-sm text-primary font-medium hover:text-orange-700 transition-colors">
                        Ver todo o histórico
                    </button>
                </div>
            </div>
        </div>
    );
}
