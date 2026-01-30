import React, { useEffect, useState } from 'react';
import { BookOpen, Video, Settings, Star, CheckCircle, PlayCircle, Trophy, GraduationCap, ArrowRight, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';

export default function TutorialHome() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Mapping icons strings from DB to components
    const iconMap = {
        'Star': Star,
        'Settings': Settings,
        'BookOpen': BookOpen,
        'Video': Video,
        'Trophy': Trophy
    };

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const completedCount = modules.filter(m => m.completed).length;
    const progressPercentage = (completedCount / modules.length) * 100;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-white/20 rounded-lg mr-3 backdrop-blur-sm">
                                <GraduationCap size={28} />
                            </div>
                            <h1 className="text-3xl font-bold">Academia Shopee Live</h1>
                        </div>
                        <p className="text-orange-100 max-w-xl text-lg">
                            Domine a arte das vendas ao vivo! Complete todos os módulos para desbloquear o recurso de Lives.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[280px]">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-orange-100 font-medium">Seu Progresso</span>
                            <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 mb-2 overflow-hidden">
                            <div
                                className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-orange-200 flex justify-between">
                            <span>{completedCount} módulos concluídos</span>
                            <span>Total: {modules.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <div
                            key={module.id}
                            onClick={handleModuleClick}
                            className={`relative bg-white/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full
                                ${isCompleted
                                    ? 'border-green-200/50 shadow-sm hover:shadow-green-100/50 cursor-pointer group'
                                    : isLocked
                                        ? 'border-gray-200 opacity-60 grayscale cursor-not-allowed'
                                        : 'border-white/50 shadow-lg hover:shadow-orange-glow hover:-translate-y-2 cursor-pointer group'
                                }
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Card Status Indicator */}
                            <div className={`h-1.5 w-full ${isCompleted ? 'bg-green-500' : isLocked ? 'bg-gray-300' : 'bg-gray-200 group-hover:bg-gradient-to-r from-orange-400 to-red-500'}`}></div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110
                                        ${isCompleted
                                            ? 'bg-green-100 text-green-600'
                                            : isLocked
                                                ? 'bg-gray-100 text-gray-400'
                                                : 'bg-gradient-to-br from-orange-100 to-red-50 text-orange-600'
                                        }`}
                                    >
                                        <IconComponent size={28} className={!isCompleted && !isLocked ? "group-hover:animate-shake" : ""} />
                                    </div>

                                    {isCompleted ? (
                                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                            <CheckCircle size={14} className="mr-1" />
                                            CONCLUÍDO
                                        </div>
                                    ) : (
                                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${isLocked ? 'text-gray-500 bg-gray-100 border-gray-200' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                                            <PlayCircle size={14} className="mr-1" />
                                            {isLocked ? 'BLOQUEADO' : 'DISPONÍVEL'}
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-bold mb-2 group-hover:text-primary transition-colors ${isCompleted ? 'text-green-800' : isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
                                    {module.title}
                                </h3>

                                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {module.description}
                                </p>

                                <div className={`mt-auto pt-4 border-t flex items-center justify-between transition-colors ${isLocked ? 'border-gray-200' : 'border-gray-100 group-hover:border-orange-100'}`}>
                                    <span className={`text-xs font-medium transition-colors ${isLocked ? 'text-gray-400' : 'text-gray-400 group-hover:text-orange-400'}`}>
                                        Módulo {index + 1}
                                    </span>
                                    <span className={`text-sm font-bold flex items-center transition-transform group-hover:translate-x-1
                                        ${isCompleted ? 'text-green-600' : isLocked ? 'text-gray-400' : 'text-primary'}`
                                    }>
                                        {isCompleted ? 'Revisar Conteúdo' : isLocked ? 'Bloqueado' : 'Iniciar Aula'}
                                        {!isLocked && <ArrowRight size={16} className="ml-2" />}
                                    </span>
                                </div>
                            </div>

                            {/* Hover Shine Effect */}
                            {!isCompleted && !isLocked && (
                                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[20deg] group-hover:animate-shine pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* TikTok Section (Locked) */}
            <div className="relative mt-12 bg-gray-900 rounded-3xl p-8 text-white shadow-xl overflow-hidden opacity-90 cursor-not-allowed group">
                {/* Overlay Lock */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-md animate-pulse">
                        <Settings className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Tutorial Live TikTok</h3>
                    <span className="bg-gray-700 text-gray-200 px-4 py-1.5 rounded-full text-sm font-bold border border-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                        EM BREVE
                    </span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 pointer-events-none">
                    <div>
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-white/20 rounded-lg mr-3">
                                <Video size={28} />
                            </div>
                            <h1 className="text-3xl font-bold">Tutorial Live TikTok</h1>
                        </div>
                        <p className="text-gray-300 max-w-xl text-lg">
                            Aprenda a dominar as lives no TikTok e expanda suas vendas.
                        </p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Módulo Bloqueado"
                icon={Lock}
                type="warning"
            >
                <p>Para manter o aprendizado sequencial e eficiente, você precisa <strong>concluir o módulo anterior</strong> antes de avançar.</p>
                <p className="mt-2 text-sm text-gray-500">Concentre-se em dominar o conteúdo atual primeiro!</p>
            </Modal>
        </div>
    );
}
