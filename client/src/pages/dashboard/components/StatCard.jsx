import { motion } from 'framer-motion'

export default function StatCard({ stat, index }) {
  const Icon = stat.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 bg-linear-to-r ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`}
      />
      <div className="relative bg-white/5 border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <p
              className={`text-3xl font-bold mt-2 bg-linear-to-r ${stat.gradient} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500 mt-2">{stat.subtitle}</p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
