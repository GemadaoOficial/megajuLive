import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Package, X, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'sonner';
import TiltCard from '../../components/ui/TiltCard';
import PremiumPageHeader from '../../components/ui/PremiumPageHeader';

export default function LiveSchedule() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [lives, setLives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLive, setEditingLive] = useState(null);

    // Form setup
    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            scheduledDate: '',
            time: '',
            description: '',
            products: [{ productName: '', productPrice: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "products"
    });

    useEffect(() => {
        fetchScheduledLives();
    }, []);

    const fetchScheduledLives = async () => {
        try {
            const response = await api.get('/lives/schedule');
            // Ensure dates are parsed correctly
            const parsedLives = response.data.map(live => ({
                ...live,
                scheduledDate: new Date(live.scheduledDate)
            }));
            setLives(parsedLives);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
            toast.error("Erro ao carregar agendamentos");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            // Combine date and time
            const dateStr = data.scheduledDate; // YYYY-MM-DD
            const timeStr = data.time; // HH:mm
            const fullDateTime = new Date(`${dateStr}T${timeStr}:00`);

            const payload = {
                title: data.title,
                scheduledDate: fullDateTime.toISOString(),
                description: data.description,
                products: data.products.filter(p => p.productName.trim() !== '')
            };

            if (editingLive) {
                await api.patch(`/lives/schedule/${editingLive.id}`, payload);
                toast.success("Live atualizada com sucesso!");
            } else {
                await api.post('/lives/schedule', payload);
                toast.success("Live agendada com sucesso!");
            }

            fetchScheduledLives();
            closeModal();
        } catch (error) {
            console.error("Error saving live", error);
            toast.error("Erro ao salvar agendamento");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja cancelar esta live agendada?')) return;

        try {
            await api.delete(`/lives/schedule/${id}`);
            toast.success("Agendamento cancelado");
            fetchScheduledLives();
            if (editingLive?.id === id) closeModal();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao cancelar agendamento");
        }
    };

    const openModal = (date = null, live = null) => {
        if (live) {
            setEditingLive(live);
            setValue('title', live.title);
            setValue('description', live.notes || '');

            const d = new Date(live.scheduledDate);
            setValue('scheduledDate', format(d, 'yyyy-MM-dd'));
            setValue('time', format(d, 'HH:mm'));

            // Set products
            setValue('products', live.products && live.products.length > 0
                ? live.products.map(p => ({ productName: p.productName, productPrice: p.productPrice }))
                : [{ productName: '', productPrice: 0 }]
            );
        } else {
            setEditingLive(null);
            reset({
                title: '',
                scheduledDate: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                time: '19:00',
                description: '',
                products: [{ productName: '', productPrice: 0 }]
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLive(null);
        reset();
    };

    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const getLivesForDay = (day) => {
        return lives.filter(live => isSameDay(live.scheduledDate, day));
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Premium Header */}
            <PremiumPageHeader
                title="Cronograma de Lives"
                subtitle="Organize suas transmissões, defina horários e prepare seus produtos com antecedência."
                icon={CalendarIcon}
                variant="orange"
                rightContent={
                    <button
                        onClick={() => openModal()}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                        <span className="text-lg">Nova Live</span>
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar Section */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 relative transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-800 capitalize tracking-tight">
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="flex bg-slate-100 rounded-xl p-1.5 shadow-inner">
                            <button onClick={prevMonth} className="p-3 hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-600 hover:text-orange-500">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentMonth(new Date())} className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-orange-600 border-x border-slate-200 mx-1">
                                Hoje
                            </button>
                            <button onClick={nextMonth} className="p-3 hover:bg-white hover:shadow-md rounded-lg transition-all text-slate-600 hover:text-orange-500">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 mb-6">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-3 lg:gap-4">
                        {calendarDays.map((day, dayIdx) => {
                            const dayLives = getLivesForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, currentMonth);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => { setSelectedDate(day); }}
                                    className={`
                                        min-h-[120px] lg:min-h-[140px] rounded-3xl p-3 border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between
                                        ${!isCurrentMonth ? 'opacity-30 bg-slate-50 border-transparent blur-[1px]' : 'bg-white border-slate-100/80 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 hover:z-10'}
                                        ${isToday(day) ? 'ring-4 ring-orange-100 bg-orange-50/30' : ''}
                                        ${isSelected ? 'border-orange-500 ring-4 ring-orange-200 bg-orange-50 shadow-inner scale-[0.98]' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors
                                            ${isToday(day) ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg' : 'text-slate-700 group-hover:bg-slate-100'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayLives.length > 0 && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-full shadow-sm animate-pulse-slow">
                                                {dayLives.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 mt-2">
                                        {dayLives.slice(0, 2).map(live => (
                                            <div
                                                key={live.id}
                                                onClick={(e) => { e.stopPropagation(); openModal(null, live); }}
                                                className="text-[10px] p-1.5 rounded-lg bg-orange-50 text-orange-800 border-l-2 border-orange-400 truncate hover:bg-orange-100 transition-colors font-bold flex items-center gap-1 shadow-sm"
                                            >
                                                <Clock size={10} className="shrink-0 text-orange-500" />
                                                {format(live.scheduledDate, 'HH:mm')}
                                            </div>
                                        ))}
                                        {dayLives.length > 2 && (
                                            <div className="text-[10px] text-slate-400 text-center font-bold">
                                                + {dayLives.length - 2} mais
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Add Button */}
                                    {isCurrentMonth && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openModal(day); }}
                                            className="absolute bottom-2 right-2 bg-slate-900 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg transform translate-y-2 group-hover:translate-y-0 hover:scale-110 z-10"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side Panel: Selected Day Details */}
                <div className="space-y-6">
                    <TiltCard className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl p-8 h-full flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1">
                                    {format(selectedDate, "EEEE", { locale: ptBR })}
                                </h3>
                                <h2 className="text-3xl font-black text-slate-800">
                                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                                </h2>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                <CalendarIcon size={24} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {getLivesForDay(selectedDate).length === 0 ? (
                                <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center opacity-60">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <CalendarIcon size={40} className="opacity-30" />
                                    </div>
                                    <p className="font-medium text-lg">Sem agendamentos.</p>
                                    <button onClick={() => openModal(selectedDate)} className="mt-4 px-6 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-bold hover:bg-orange-100 transition-colors">
                                        Criar Agendamento
                                    </button>
                                </div>
                            ) : (
                                getLivesForDay(selectedDate).map(live => (
                                    <div key={live.id} className="group relative bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all hover:border-orange-200 transform hover:-translate-y-1">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => openModal(null, live)}
                                                className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(live.id)}
                                                className="p-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                                <Clock size={12} className="text-orange-400" />
                                                {format(live.scheduledDate, 'HH:mm')}
                                            </span>
                                            {live.status === 'SCHEDULED' && <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Agendada</span>}
                                        </div>

                                        <h4 className="font-bold text-lg text-slate-800 mb-2 leading-tight">{live.title}</h4>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">{live.notes || "Sem descrição"}</p>

                                        {live.products && live.products.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                                <Package size={14} className="text-orange-500" />
                                                <span>{live.products.length} produtos adicionados</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </TiltCard>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                {editingLive ? <Edit2 size={24} className="text-orange-500" /> : <Plus size={24} className="text-orange-500" />}
                                {editingLive ? 'Editar Live' : 'Agendar Nova Live'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="scheduleForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Título da Live</label>
                                        <input
                                            {...register("title", { required: "Título é obrigatório" })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            placeholder="Ex: Mega Liquidação de Verão"
                                        />
                                        {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                                        <input
                                            type="date"
                                            {...register("scheduledDate", { required: "Data é obrigatória" })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Horário</label>
                                        <input
                                            type="time"
                                            {...register("time", { required: "Horário é obrigatório" })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Descrição / Notas</label>
                                        <textarea
                                            {...register("description")}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                                            placeholder="Detalhes sobre o que será apresentado..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Products Section */}
                                <div className="border-t pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <Package size={20} className="text-orange-500" />
                                            Produtos em Destaque
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => append({ productName: '', productPrice: 0 })}
                                            className="text-sm text-orange-600 font-bold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            + Adicionar Produto
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex gap-3 items-start animate-fade-in">
                                                <div className="flex-1">
                                                    <input
                                                        {...register(`products.${index}.productName`, { required: "Nome do produto obrigatório" })}
                                                        placeholder="Nome do Produto"
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`products.${index}.productPrice`)}
                                                        placeholder="Preço"
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {fields.length === 0 && (
                                            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                                                Nenhum produto adicionado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="scheduleForm"
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-glow transition-all hover:-translate-y-1"
                            >
                                {editingLive ? 'Salvar Alterações' : 'Realizar Agendamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
