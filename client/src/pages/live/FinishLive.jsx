import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { liveService } from '../../services/liveService';
import { Upload, CheckCircle, FileSpreadsheet, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
    followersEnd: z.number({ invalid_type_error: "Obrigatório" }).min(0),
    coinsEnd: z.number({ invalid_type_error: "Obrigatório" }).min(0),
});

export default function FinishLive() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const [screenshots, setScreenshots] = useState([]);
    const [aiData, setAiData] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);
    const [finishing, setFinishing] = useState(false);

    const onDrop = async (acceptedFiles) => {
        // Limit to 10 files
        const newFiles = [...screenshots, ...acceptedFiles].slice(0, 10);
        setScreenshots(newFiles);

        // Auto-extract data via AI if we have files
        if (newFiles.length > 0) {
            analyzeScreenshots(newFiles);
        }
    };

    const analyzeScreenshots = async (files) => {
        setLoadingAi(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('screenshots', file);
            });

            const data = await liveService.uploadScreenshot(formData);
            setAiData(data);

            // Auto-fill form fields if AI returns data (optional, but requested read-only fields for specific metrics)
            if (data.totalRevenue) setValue('coinsEnd', parseFloat(data.totalRevenue)); // Example mapping if needed, but keeping explicit inputs separate

            toast.success('Análise de IA concluída!');
        } catch (error) {
            console.error('Erro na IA:', error);
            toast.error('Falha ao processar imagens pela IA.');
        } finally {
            setLoadingAi(false);
        }
    };

    const removeScreenshot = (index) => {
        const newFiles = [...screenshots];
        newFiles.splice(index, 1);
        setScreenshots(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 10,
        disabled: loadingAi
    });

    const onSubmit = async (data) => {
        setFinishing(true);
        try {
            const formData = new FormData();
            // Append regular fields
            formData.append('followersEnd', data.followersEnd);
            formData.append('coinsEnd', data.coinsEnd);

            // Append screenshots
            screenshots.forEach(file => {
                formData.append('screenshots', file);
            });

            // Append AI Data if exists
            if (aiData) {
                formData.append('aiExtractedData', JSON.stringify(aiData));
                // Append metrics
                formData.append('likes', aiData.likes);
                formData.append('shares', aiData.shares);
                formData.append('chatInteractions', aiData.comments);
                formData.append('totalViews', aiData.totalViews);
                formData.append('engagementRate', aiData.engagementRate);
            }

            // Correct usage: Pass formData
            await liveService.finishLive(id, formData);

            toast.success('Live finalizada com sucesso!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao finalizar live');
        } finally {
            setFinishing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar e Relatório</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="text-primary" /> Screenshots do Relatório Shopee (Máx 10)
                    </h2>

                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'} ${loadingAi ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input {...getInputProps()} />
                        {loadingAi ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="animate-spin text-primary mb-2" size={40} />
                                <p className="text-gray-600 font-medium animate-pulse">A Inteligência Artificial está analisando suas imagens...</p>
                                <p className="text-xs text-gray-400 mt-2">Isso pode levar alguns segundos</p>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                <Upload className="mx-auto mb-2" size={32} />
                                <p>Arraste até 10 prints ou clique para selecionar</p>
                            </div>
                        )}
                    </div>

                    {/* Screenshots Gallery */}
                    {screenshots.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {screenshots.map((file, index) => (
                                <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Print ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeScreenshot(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AI Data Preview (Read Only Fields) */}
                    {aiData && (
                        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                                ✨ Dados Extraídos pela IA (Somente Leitura)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Curtidas</label>
                                    <div className="text-2xl font-bold text-gray-800">{aiData.likes?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Comentários</label>
                                    <div className="text-2xl font-bold text-gray-800">{aiData.comments?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Compartilhamentos</label>
                                    <div className="text-2xl font-bold text-gray-800">{aiData.shares?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Engajamento</label>
                                    <div className="text-2xl font-bold text-gray-800">{aiData.engagementRate}%</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-3 gap-4 text-sm text-blue-700">
                                <p>Visualizações: <span className="font-semibold">{aiData.totalViews?.toLocaleString()}</span></p>
                                <p>Pedidos: <span className="font-semibold">{aiData.totalOrders}</span></p>
                                <p>Receita Est.: <span className="font-semibold">R$ {parseFloat(aiData.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
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
                                placeholder="Digite o total de seguidores"
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
                                placeholder="Digite o saldo final"
                            />
                            {errors.coinsEnd && <p className="text-red-500 text-xs">{errors.coinsEnd.message}</p>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={finishing || loadingAi}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {finishing ? (
                        <>
                            <Loader2 className="animate-spin" /> Salvando Relatório...
                        </>
                    ) : 'FINALIZAR E GERAR RELATÓRIO'}
                </button>
            </form>
        </div>
    );
}
