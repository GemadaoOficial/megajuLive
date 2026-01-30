import React, { useEffect, useState } from 'react';
import { liveService } from '../../services/liveService';
import { Calendar, Clock, DollarSign, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveHistory() {
    const [lives, setLives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        liveService.getHistory()
            .then(setLives)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando histórico...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Minhas Lives</h1>
                <Link to="/live/start" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    + Nova Live
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duração</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ROI</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Moedas Gastas</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {lives.map((live) => (
                                <tr key={live.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(live.startedAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500 pl-6">
                                            {new Date(live.startedAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {live.duration ? `${live.duration} min` : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${live.status === 'IN_PROGRESS' ? 'bg-red-100 text-red-600 animate-pulse' :
                                                live.status === 'FINISHED' ? 'bg-green-100 text-green-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {live.status === 'IN_PROGRESS' ? 'AO VIVO' : live.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {live.roi ? (
                                            <span className="flex items-center gap-1 text-green-600 font-bold">
                                                <TrendingUp size={14} /> {live.roi.toFixed(0)}%
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {live.coinsSpent ? live.coinsSpent.toFixed(2) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {live.status === 'IN_PROGRESS' ? (
                                            <Link to={`/live/${live.id}/active`} className="text-red-500 hover:text-red-700 font-medium text-sm">
                                                Retomar
                                            </Link>
                                        ) : (
                                            <button className="text-gray-400 hover:text-primary transition-colors">
                                                <ChevronRight />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {lives.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Nenhuma live encontrada. Comece a transmitir agora!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
