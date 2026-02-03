import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
    const colorClasses = {
        orange: 'from-orange-500 to-red-500',
        blue: 'from-blue-500 to-indigo-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500'
    };

    const bgClasses = {
        orange: 'bg-orange-100 text-orange-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bgClasses[color] || bgClasses.orange} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'} bg-white/50 px-2 py-1 rounded-full`}>
                        {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    );
}
