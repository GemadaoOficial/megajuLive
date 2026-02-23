export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Filtrar por...',
  className = '',
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden transition-all ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
