import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { liveService } from '../../services/liveService';
import { Clock, Eye, MessageCircle, Save, StopCircle } from 'lucide-react';

export default function LiveInProgress() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [live, setLive] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [metrics, setMetrics] = useState({ peakViewers: 0, chatInteractions: 0 });

    useEffect(() => {
        // Carregar dados iniciais
        liveService.getDetails(id).then(data => {
            setLive(data);
            if (data.status !== 'IN_PROGRESS') {
                const confirm = window.confirm("Esta live já foi finalizada. Deseja ver os detalhes?");
                if (confirm) navigate(`/live/${id}/details`);
            }
            // Calcular tempo inicial se já começou
            const start = new Date(data.startedAt).getTime();
            setElapsed(Math.floor((Date.now() - start) / 1000));
        });

        const interval = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [id, navigate]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUpdate = async () => {
        try {
            await liveService.updateLive(id, metrics);
            alert('Métricas atualizadas!');
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinish = () => {
        if (window.confirm("Tem certeza que deseja encerrar a live?")) {
            navigate(`/live/${id}/finish`);
        }
    };

    if (!live) return <div>Carregando live...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t-4 border-red-500 animate-pulse-slow">
                <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-600 animate-ping"></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">AO VIVO</h2>
                        <p className="text-sm text-gray-500">Iniciada em {new Date(live.startedAt).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-3xl font-mono font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
                    <Clock size={24} className="text-primary" />
                    {formatTime(elapsed)}
                </div>
            </div>

            {/* Metrics Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Eye size={20} /> Pico de Espectadores
                        </h3>
                    </div>
                    <input
                        type="number"
                        className="w-full text-4xl font-bold text-center border-b-2 border-gray-200 focus:border-primary outline-none py-2"
                        value={metrics.peakViewers}
                        onChange={(e) => setMetrics({ ...metrics, peakViewers: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <MessageCircle size={20} /> Interações no Chat
                        </h3>
                    </div>
                    <input
                        type="number"
                        className="w-full text-4xl font-bold text-center border-b-2 border-gray-200 focus:border-primary outline-none py-2"
                        value={metrics.chatInteractions}
                        onChange={(e) => setMetrics({ ...metrics, chatInteractions: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={handleUpdate}
                    className="flex-1 bg-white border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Save size={20} /> Atualizar Métricas
                </button>

                <button
                    onClick={handleFinish}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <StopCircle size={20} /> Finalizar Live
                </button>
            </div>
        </div>
    );
}
