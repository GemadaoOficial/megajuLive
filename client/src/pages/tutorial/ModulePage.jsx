import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Se tiver instalado, senão usamos display simples
import { api } from '../../services/api';
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react';

export default function ModulePage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markingComplete, setMarkingComplete] = useState(false);

    useEffect(() => {
        loadModule();
    }, [slug]);

    const loadModule = async () => {
        try {
            const response = await api.get(`/modules/${slug}`);
            setModule(response.data);
        } catch (error) {
            console.error('Erro ao carregar módulo', error);
            alert('Erro ao carregar módulo. Tente novamente.');
            navigate('/tutorials');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!module) return;
        setMarkingComplete(true);
        try {
            await api.post(`/modules/${module.id}/complete`);
            setModule(prev => ({ ...prev, completed: true }));
            // Opcional: Efeito de confete ou som
        } catch (error) {
            console.error('Erro ao completar módulo', error);
            alert('Não foi possível registrar o progresso.');
        } finally {
            setMarkingComplete(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!module) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/tutorials')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Voltar para Tutoriais
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
                        {module.completed && (
                            <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle size={16} className="mr-1" />
                                Concluído
                            </span>
                        )}
                    </div>

                    <div className="prose prose-orange max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-8" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-6" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                code: ({ node, inline, className, children, ...props }) => {
                                    return !inline ? (
                                        <div className="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto">
                                            <code className={className} {...props}>{children}</code>
                                        </div>
                                    ) : (
                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-500" {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {module.content}
                        </ReactMarkdown>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-6 border-t flex justify-end">
                    {module.completed ? (
                        <button
                            disabled
                            className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium cursor-default"
                        >
                            <CheckCircle size={20} className="mr-2" />
                            Módulo Concluído
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={markingComplete}
                            className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-70"
                        >
                            {markingComplete ? 'Registrando...' : 'Marcar como Concluído'}
                            {!markingComplete && <CheckCircle size={20} className="ml-2" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
