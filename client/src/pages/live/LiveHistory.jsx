import React, { useEffect, useState } from 'react';
import { liveService } from '../../services/liveService';
import { Calendar, Clock, DollarSign, TrendingUp, ChevronRight, Play, Archive, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import TiltCard from '../../components/ui/TiltCard';
import PremiumPageHeader from '../../components/ui/PremiumPageHeader';

export default function LiveHistory() {
    const [lives, setLives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        liveService.getHistory()
            .then(setLives)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Premium Header */}
            <PremiumPageHeader
                title="Histórico de Transmissões"
                subtitle="Acesse o relatório completo de suas lives passadas e analise seu desempenho."
                icon={History}
                variant="blue"
                rightContent={
                    <Link
                        to="/live/start"
                        className="group relative w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-100/50 to-transparent -translate-x-full group-hover:animate-shine"></div>
                        <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                            <Play size={20} className="fill-blue-600" />
                        </div>
                        Nova Live
                    </Link>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                {lives.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Archive size={40} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhum registro encontrado</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Você ainda não realizou nenhuma live. Comece agora para construir seu histórico!
                        </p>
                    </div>
                ) : (
                    lives.map((live, index) => (
                        <TiltCard
                            key={live.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className={`group bg-white border border-slate-100 rounded-[2rem] shadow-lg hover:shadow-2xl overflow-hidden flex flex-col h-full`}
                        >
                            <div className="relative h-32 bg-slate-100 overflow-hidden">
                                {/* Thumbnail Generator Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${live.status === 'IN_PROGRESS' ? 'from-red-500 to-orange-600' : 'from-slate-700 to-slate-900'}`}></div>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                                <div className="absolute bottom-4 left-6 text-white z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar size={14} className="opacity-80" />
                                        <span className="text-sm font-bold opacity-90">
                                            {new Date(live.startedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-xs opacity-75 font-medium flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(live.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 ${live.status === 'IN_PROGRESS'
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : live.status === 'FINISHED'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-500 text-white'
                                        }`}>
                                        {live.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>}
                                        {live.status === 'IN_PROGRESS' ? 'AO VIVO' : live.status === 'FINISHED' ? 'Concluída' : live.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col relative z-20 -mt-6">
                                <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-50 mb-4 h-full flex flex-col justify-between">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Duração</p>
                                            <p className="font-bold text-slate-800 flex items-center gap-1">
                                                <Clock size={14} className="text-slate-400" />
                                                {live.duration ? `${live.duration} min` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">ROI</p>
                                            <p className={`font-bold flex items-center gap-1 ${live.roi && live.roi > 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                                                <TrendingUp size={14} />
                                                {live.roi ? `${live.roi.toFixed(0)}%` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Investido</p>
                                            <p className="font-bold text-slate-800 flex items-center gap-1">
                                                <DollarSign size={14} className="text-slate-400" />
                                                {live.coinsSpent ? live.coinsSpent.toFixed(2) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {live.status === 'IN_PROGRESS' ? (
                                        <Link
                                            to={`/live/${live.id}/active`}
                                            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play size={16} fill="white" /> Retomar Live
                                        </Link>
                                    ) : (
                                        <button className="w-full py-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold text-sm transition-colors border border-slate-100 hover:border-blue-200">
                                            Ver Detalhes
                                        </button>
                                    )}
                                </div>
                            </div>
                        </TiltCard>
                    ))
                )}
            </div>
        </div>
    );
}
