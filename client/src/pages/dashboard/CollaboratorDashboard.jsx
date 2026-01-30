import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
    DollarSign, Video, Users, TrendingUp, Calendar, Clock,
    Heart, Eye, MessageSquare, Share2, ArrowUpRight, Zap, Play, Trophy
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import TiltCard from '../../components/ui/TiltCard';
import PremiumPageHeader from '../../components/ui/PremiumPageHeader';

const PremiumStatCard = ({ title, value, icon: Icon, trend, trendValue, color, delay }) => {
    // Color mapping for TiltCard styling
    const colorStyles = {
        orange: 'bg-gradient-to-br from-orange-50 to-white text-orange-600 border-orange-100',
        green: 'bg-gradient-to-br from-emerald-50 to-white text-emerald-600 border-emerald-100',
        blue: 'bg-gradient-to-br from-blue-50 to-white text-blue-600 border-blue-100',
        purple: 'bg-gradient-to-br from-purple-50 to-white text-purple-600 border-purple-100',
    };

    const trendColor = trend === 'up' ? 'text-emerald-500 bg-emerald-100/50' : 'text-rose-500 bg-rose-100/50';

    return (
        <TiltCard
            style={{ animationDelay: `${delay}ms` }}
            className={`h-full border shadow-lg hover:shadow-xl ${colorStyles[color] || colorStyles.orange}`}
        >
            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-white shadow-sm ring-1 ring-black/5`}>
                        <Icon size={24} className="opacity-90" />
                    </div>
                    {trend && (
                        <div className={`flex items-center text-xs font-bold ${trendColor} px-2.5 py-1 rounded-full border border-white/50 backdrop-blur-sm shadow-sm`}>
                            <TrendingUp size={12} className="mr-1" />
                            {trendValue}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{value}</h3>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                </div>
            </div>
        </TiltCard>
    );
};

export default function CollaboratorDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUserName(res.data.name.split(' ')[0]); // First name
        } catch (error) {
            console.error(error);
        }
    }

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
            <div className="flex justify-center items-center h-[50vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={20} className="text-purple-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const { summary, recentLives } = stats || { summary: {}, recentLives: [] };

    // Prepare Chart Data
    const chartData = [...recentLives].reverse().map(live => ({
        name: new Date(live.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        receita: live.revenue || 0,
        views: live.totalViews || 0,
    }));

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Premium Header */}
            <PremiumPageHeader
                title={`Olá, ${userName || 'Creator'}!`}
                subtitle="Painel de Controle do Creator"
                icon={Zap}
                variant="purple"
                rightContent={
                    <button
                        onClick={() => navigate('/live/start')}
                        className="group relative px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-purple-50 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover:animate-shine"></div>
                        <div className="bg-purple-100 p-2 rounded-full group-hover:bg-purple-200 transition-colors">
                            <Play size={20} className="fill-purple-600" />
                        </div>
                        Iniciar Nova Live
                    </button>
                }
            />

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">

                {/* Main Stats (Revenue) - Span 2 */}
                <div className="md:col-span-2 lg:col-span-2">
                    <PremiumStatCard
                        title="Receita Total"
                        value={`R$ ${summary.totalRevenue?.toFixed(2)}`}
                        icon={DollarSign}
                        color="green"
                        trend="up"
                        trendValue="18%"
                        delay={100}
                    />
                </div>

                {/* Secondary Stats */}
                <PremiumStatCard
                    title="Seguidores"
                    value={summary.totalFollowersGained}
                    icon={Users}
                    color="blue"
                    trend="up"
                    trendValue="5%"
                    delay={200}
                />

                <PremiumStatCard
                    title="Visualizações"
                    value={(summary.totalViews / 1000).toFixed(1) + 'k'}
                    icon={Eye}
                    color="purple"
                    trend="up"
                    trendValue="12%"
                    delay={300}
                />

                {/* Main Chart Section - Span 3 */}
                <TiltCard className="md:col-span-3 lg:col-span-3 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl relative min-h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-1.5 bg-orange-100 rounded-lg">
                                    <TrendingUp size={16} className="text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Performance de Receita</h2>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-9">Evolução dos seus ganhos nas últimas lives</p>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-xl flex text-xs font-bold text-slate-500 border border-slate-100">
                            <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-slate-900 ring-1 ring-black/5">Semana</button>
                            <button className="px-4 py-2 hover:text-slate-900 transition-colors">Mês</button>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => `R$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.5)',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                                        padding: '12px 16px',
                                        fontWeight: 'bold'
                                    }}
                                    itemStyle={{ color: '#64748b' }}
                                    formatter={(value) => [`R$ ${value}`, 'Receita']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="receita"
                                    stroke="#8b5cf6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenuePremium)"
                                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#8b5cf6' }}
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </TiltCard>

                {/* Recent Activities / Tips - Span 1 */}
                <TiltCard className="md:col-span-3 lg:col-span-1 bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <Trophy size={20} className="text-yellow-400" />
                            </div>
                            <h3 className="font-bold text-lg">Dica do Dia</h3>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                "Lives com enquetes interativas retêm <span className="text-white font-bold">40% mais audiência</span>. Experimente criar uma hoje!"
                            </p>

                            <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95">
                                <Share2 size={16} /> Ver Tutoriais
                            </button>
                        </div>
                    </div>
                </TiltCard>
            </div>
        </div>
    );
}
