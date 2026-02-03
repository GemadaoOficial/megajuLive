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
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-gray-200 transform transition-all hover:-translate-y-0.5 ${type === 'danger'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-200'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-200'
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
