function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-[2rem] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700">
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">HealthAI is typing</p>
        <div className="mt-2 flex gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-500" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-500 delay-150" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-500 delay-300" />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
