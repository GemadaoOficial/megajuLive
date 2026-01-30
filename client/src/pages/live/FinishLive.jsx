import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { liveService } from '../../services/liveService';
import { Upload, CheckCircle, FileSpreadsheet, Image as ImageIcon, Loader2 } from 'lucide-react';

const schema = z.object({
    followersEnd: z.number({ invalid_type_error: "Obrigatório" }).min(0),
    coinsEnd: z.number({ invalid_type_error: "Obrigatório" }).min(0),
});

export default function FinishLive() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const [screenshot, setScreenshot] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [finishing, setFinishing] = useState(false);

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setScreenshot(file);

        // Auto-extract data via AI
        if (file) {
            setLoadingAi(true);
            try {
                const formData = new FormData();
                formData.append('screenshot', file);
                const data = await liveService.uploadScreenshot(formData);
                setAiData(data);
            } catch (error) {
                console.error('Erro na IA:', error);
                alert('Falha ao processar imagem pela IA. Preencha manualmente.');
            } finally {
                setLoadingAi(false);
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const onSubmit = async (data) => {
        setFinishing(true);
        try {
            await liveService.finishLive(id, {
                ...data,
                aiData: aiData // Enviar dados extraídos se houver
            });
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Erro ao finalizar live');
        } finally {
            setFinishing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar e Relatório</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="text-primary" /> Screenshot do Relatório Shopee
                    </h2>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}>
                        <input {...getInputProps()} />
                        {loadingAi ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="animate-spin text-primary mb-2" size={32} />
                                <p className="text-gray-600">A Inteligência Artificial está lendo sua imagem...</p>
                            </div>
                        ) : screenshot ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                                <CheckCircle /> Imagem carregada: {screenshot.name}
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <Upload className="mx-auto mb-2" size={32} />
                                <p>Arraste o print do relatório da Shopee aqui ou clique para selecionar</p>
                            </div>
                        )}
                    </div>

                    {/* AI Data Preview */}
                    {aiData && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-2">✨ Dados Extraídos pela IA:</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                                <p>Pedidos: {aiData.totalOrders || '-'}</p>
                                <p>Receita: {aiData.totalRevenue || '-'}</p>
                                <p>Visualizações: {aiData.totalViews || '-'}</p>
                                <p>Likes: {aiData.likes || '-'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Manual Input Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Dados Finais de Perfil</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Seguidores no Final</label>
                            <input
                                type="number"
                                {...register('followersEnd', { valueAsNumber: true })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                            {errors.followersEnd && <p className="text-red-500 text-xs">{errors.followersEnd.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Saldo de Moedas Final</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('coinsEnd', { valueAsNumber: true })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            />
                            {errors.coinsEnd && <p className="text-red-500 text-xs">{errors.coinsEnd.message}</p>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={finishing || loadingAi}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                >
                    {finishing ? 'Salvando...' : 'FINALIZAR E GERAR RELATÓRIO'}
                </button>
            </form>
        </div>
    );
}
