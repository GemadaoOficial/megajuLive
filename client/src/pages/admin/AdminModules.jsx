import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { adminService } from '../../services/adminService';
import { Plus, Edit, Trash2, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminModules() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        content: '',
        videoUrl: '',
        order: '',
        icon: '📱'
    });

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            const response = await api.get('/modules');
            setModules(response.data);
        } catch (error) {
            console.error('Error loading modules:', error);
            toast.error('Erro ao carregar módulos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (module = null) => {
        if (module) {
            setEditingModule(module);
            setFormData({
                title: module.title,
                slug: module.slug,
                description: module.description,
                content: module.content,
                videoUrl: module.videoUrl || '',
                order: module.order,
                icon: module.icon
            });
        } else {
            setEditingModule(null);
            setFormData({
                title: '',
                slug: '',
                description: '',
                content: '',
                videoUrl: '',
                order: modules.length + 1,
                icon: '📱'
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este módulo?')) {
            try {
                await adminService.deleteModule(id);
                toast.success('Módulo excluído!');
                loadModules();
            } catch (error) {
                toast.error('Erro ao excluir módulo');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingModule) {
                await adminService.updateModule(editingModule.id, formData);
                toast.success('Módulo atualizado!');
            } else {
                await adminService.createModule(formData);
                toast.success('Módulo criado!');
            }
            setIsModalOpen(false);
            loadModules();
        } catch (error) {
            toast.error('Erro ao salvar módulo. Verifique o Slug.');
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gerenciar Tutoriais</h1>
                    <p className="text-slate-400">Crie e edite os módulos de treinamento.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition"
                >
                    <Plus size={20} /> Novo Módulo
                </button>
            </div>

            <div className="grid gap-4">
                {modules.map((module) => (
                    <div key={module.id} className="bg-white/5 p-6 rounded-2xl border border-white/8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl">{module.icon}</div>
                            <div>
                                <h3 className="font-bold text-white">{module.order}. {module.title}</h3>
                                <p className="text-sm text-slate-400">{module.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenModal(module)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg">
                                <Edit size={20} />
                            </button>
                            <button onClick={() => handleDelete(module.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Simples */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0a12] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
                                <input required className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Slug (URL)</label>
                                    <input required className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ordem</label>
                                    <input type="number" required className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição Curta</label>
                                <input required className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">URL do Vídeo (Embed)</label>
                                <input className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Conteúdo (Markdown)</label>
                                <textarea required rows={5} className="w-full bg-white/5 border border-white/8 text-white placeholder-white/30 p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-200">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
