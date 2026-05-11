function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-50/70">
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-50 text-cyan-600 shadow-sm transition duration-300 group-hover:bg-cyan-100">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  )
}

export default FeatureCard
