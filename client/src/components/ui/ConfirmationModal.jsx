import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    type = "danger" // danger | info
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f0f1a] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-white/[0.08]">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-black/20 transform transition-all hover:-translate-y-0.5 ${type === 'danger'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/20'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
