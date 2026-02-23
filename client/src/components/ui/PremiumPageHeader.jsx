import React from 'react';

const PremiumPageHeader = ({ title, subtitle, icon: Icon, rightContent, variant = 'orange' }) => {

    // Variant config
    const colors = {
        orange: {
            bg: 'bg-slate-900',
            glow1: 'from-orange-500/20 to-red-600/20',
            glow2: 'bg-indigo-500/10',
            titleGradient: 'from-white via-orange-100 to-orange-200',
            accent: 'text-orange-400',
            badge: 'bg-orange-500',
            badgePing: 'bg-orange-400'
        },
        purple: {
            bg: 'bg-slate-900',
            glow1: 'from-purple-500/20 to-pink-600/20',
            glow2: 'bg-blue-500/10',
            titleGradient: 'from-white via-purple-100 to-pink-200',
            accent: 'text-purple-400',
            badge: 'bg-purple-500',
            badgePing: 'bg-purple-400'
        },
        blue: {
            bg: 'bg-slate-900',
            glow1: 'from-blue-500/20 to-cyan-600/20',
            glow2: 'bg-purple-500/10',
            titleGradient: 'from-white via-blue-100 to-cyan-200',
            accent: 'text-blue-400',
            badge: 'bg-blue-500',
            badgePing: 'bg-blue-400'
        },
        emerald: {
            bg: 'bg-slate-900',
            glow1: 'from-emerald-500/20 to-green-600/20',
            glow2: 'bg-teal-500/10',
            titleGradient: 'from-white via-emerald-100 to-green-200',
            accent: 'text-emerald-400',
            badge: 'bg-emerald-500',
            badgePing: 'bg-emerald-400'
        }
    };

    const theme = colors[variant] || colors.orange;

    return (
        <div className={`relative group ${theme.bg} rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.002] mb-10`}>
            {/* Dynamic Background Mesh */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-black z-0"></div>
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-b ${theme.glow1} rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse-slow`}></div>
            <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] ${theme.glow2} rounded-full blur-[80px] -ml-20 -mb-20 animate-float`}></div>

            {/* Floating Particles (Simulated) */}
            <div className={`absolute top-1/4 left-1/4 w-2 h-2 ${theme.badge} rounded-full animate-ping opacity-20`}></div>
            <div className={`absolute top-3/4 right-1/4 w-3 h-3 ${theme.badge} rounded-full animate-bounce opacity-20 delay-700`}></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md shadow-lg animate-fade-in-up">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.badgePing} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.badge}`}></span>
                        </span>
                        <span className={`text-xs font-bold tracking-wider uppercase ${theme.accent} opacity-90`}>Shopee Live Premium</span>
                    </div>

                    <h1 className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r ${theme.titleGradient} tracking-tight leading-tight drop-shadow-xs`}>
                        <div className="flex items-center gap-4">
                            {Icon && <Icon size={48} className={`text-white/20`} />}
                            {title}
                        </div>
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed font-light">
                        {subtitle}
                    </p>
                </div>

                {/* Right Side Content (Stats, Buttons, etc.) */}
                {rightContent && (
                    <div className="w-full md:w-auto">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[300px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group cursor-default">
                            <div className={`absolute -inset-1 bg-linear-to-r ${theme.glow1} rounded-3xl blur-sm opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
                            <div className="relative z-10">
                                {rightContent}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumPageHeader;
