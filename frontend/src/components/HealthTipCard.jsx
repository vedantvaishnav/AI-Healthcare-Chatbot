function HealthTipCard({ title, description }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white/95 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-600">Tip</p>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

export default HealthTipCard
