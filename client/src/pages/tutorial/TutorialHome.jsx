import React, { useEffect, useState } from 'react';
import { BookOpen, Video, Settings, Star, CheckCircle, PlayCircle, Trophy, GraduationCap, ArrowRight, Lock, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import TiltCard from '../../components/ui/TiltCard';
import PremiumPageHeader from '../../components/ui/PremiumPageHeader';

export default function TutorialHome() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const iconMap = { 'Star': Star, 'Settings': Settings, 'BookOpen': BookOpen, 'Video': Video, 'Trophy': Trophy };

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            const response = await api.get('/modules');
            setModules(response.data);
        } catch (error) {
            console.error('Erro ao carregar módulos', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-orange-500/15 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    const completedCount = modules.filter(m => m.completed).length;
    const progressPercentage = (completedCount / modules.length) * 100;

    return (
        <div className="space-y-10 animate-fade-in pb-16 perspective-1000">
            {/* Immersive Header using Component */}
            <PremiumPageHeader
                title={<>Shopee Live <br /> Masterclass</>}
                subtitle={<>Desbloqueie todo o potencial das suas vendas. <span className="text-orange-400 font-semibold">Complete 100% dos módulos</span> para receber sua certificação oficial.</>}
                variant="orange"
                rightContent={
                    <>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-slate-400 font-medium uppercase text-xs tracking-widest">Seu Nível</span>
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>

                        <div className="relative w-full bg-slate-800 rounded-full h-4 mb-4 shadow-inner overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer"></div>
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-orange-500" /> {completedCount} Concluídos</span>
                            <span>{modules.length - completedCount} Restantes</span>
                        </div>
                    </>
                }
            />

            {/* Modules Grid (3D Tilt Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                {modules.map((module, index) => {
                    const IconComponent = iconMap[module.icon] || BookOpen;
                    const isCompleted = module.completed;
                    const isLocked = index > 0 && !modules[index - 1].completed;

                    const handleModuleClick = () => {
                        if (isLocked) {
                            setIsModalOpen(true);
                            return;
                        }
                        navigate(`/tutorials/${module.slug}`);
                    };

                    return (
                        <TiltCard
                            key={module.id}
                            isCompleted={isCompleted}
                            disabled={isLocked}
                            onClick={handleModuleClick}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className={`
                                h-full rounded-[2rem] border transition-all duration-300 animate-slide-up
                                ${isCompleted
                                    ? 'bg-white/[0.05] border-emerald-500/30 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.1)] group'
                                    : isLocked
                                        ? 'bg-white/[0.02] border-white/[0.06] cursor-not-allowed opacity-80'
                                        : 'bg-white/[0.05] border-white/[0.08] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(249,115,22,0.15)] cursor-pointer group hover:border-orange-500/30'
                                }
                            `}
                        >
                            <div className="p-8 flex flex-col h-full relative z-10">
                                {/* LOCKED OVERLAY */}
                                {isLocked && (
                                    <div className="absolute inset-0 z-30 backdrop-blur-[3px] bg-black/40 flex flex-col items-center justify-center text-center p-6 grayscale">
                                        <div className="bg-white/[0.08] p-4 rounded-2xl shadow-xl shadow-black/20 mb-3 transform scale-90">
                                            <Lock size={24} className="text-slate-400" />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 tracking-widest uppercase">Bloqueado</span>
                                    </div>
                                )}

                                {/* Top Icons & Status */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`
                                        w-16 h-16 rounded-2xl flex items-center justify-center relative transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-inner group-hover:scale-110 group-hover:rotate-3'
                                            : isLocked
                                                ? 'bg-white/[0.05] text-slate-500'
                                                : 'bg-gradient-to-br from-orange-500/15 to-rose-500/10 text-orange-400 shadow-sm group-hover:shadow-orange-500/10 group-hover:scale-110 group-hover:-rotate-3'
                                        }
                                    `}>
                                        <IconComponent size={30} strokeWidth={1.5} />
                                        {isCompleted && (
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-[#0a0a12]">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>

                                    {isCompleted ? (
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                            <Trophy size={12} /> Concluído
                                        </div>
                                    ) : !isLocked && (
                                        <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 group-hover:bg-orange-500/20 transition-colors">
                                            <PlayCircle size={12} /> Disponível
                                        </div>
                                    )}
                                </div>

                                {/* Content Info */}
                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold mb-3 leading-tight
                                        ${isCompleted ? 'text-emerald-300' : 'text-white group-hover:text-orange-400 transition-colors'}
                                    `}>
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">
                                        {module.description}
                                    </p>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Aula 0{index + 1}
                                    </span>

                                    {!isLocked && (
                                        <button className={`
                                            flex items-center gap-2 text-sm font-bold transition-all duration-300 transform group-hover:translate-x-2
                                            ${isCompleted ? 'text-emerald-600' : 'text-orange-500'}
                                        `}>
                                            {isCompleted ? 'Revisar' : 'Começar'}
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </TiltCard>
                    );
                })}

                {/* Coming Soon Card (Stays Flat but Glassy) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 relative h-64 rounded-[2.5rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-900"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/80 to-transparent"></div>

                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10 shadow-2xl animate-float">
                            <Settings size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Dominando o TikTok Live</h3>
                        <p className="text-slate-400 mb-6 font-light">Expanda suas fronteiras. Em breve na plataforma.</p>
                        <span className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-slate-300 uppercase tracking-widest backdrop-blur-sm">
                            Em Desenvolvimento
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal de Bloqueio */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Conteúdo Bloqueado"
            >
                <div className="text-center py-8">
                    <div className="w-24 h-24 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Continue sua Jornada!</h3>
                    <p className="text-slate-400 mb-8 px-8 leading-relaxed">
                        Para manter a qualidade do aprendizado, os módulos são liberados sequencialmente.
                        Finalize o módulo anterior para destravar este conteúdo exclusivo.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-primary text-white px-10 py-3.5 rounded-xl font-bold hover:bg-orange-600 transition-all transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        Entendi, vou focar!
                    </button>
                </div>
            </Modal>
        </div>
    );
}
