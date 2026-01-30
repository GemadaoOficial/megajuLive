import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, icon: Icon, type = 'info' }) {
    if (!isOpen) return null;

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const typeColors = {
        info: 'text-blue-500 bg-blue-100',
        warning: 'text-orange-500 bg-orange-100',
        error: 'text-red-500 bg-red-100',
        success: 'text-green-500 bg-green-100',
    };

    const gradientColors = {
        info: 'from-blue-500 to-cyan-500',
        warning: 'from-orange-500 to-red-500',
        error: 'from-red-500 to-pink-600',
        success: 'from-green-500 to-emerald-500',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-float">
                {/* Decorative Top Line */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${gradientColors[type] || gradientColors.info}`}></div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        {Icon && (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[type] || typeColors.info} shadow-inner`}>
                                <Icon size={24} className="animate-pulse" />
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

                    <div className="text-gray-600 leading-relaxed mb-6">
                        {children}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className={`px-6 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r ${gradientColors[type] || gradientColors.info}`}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
