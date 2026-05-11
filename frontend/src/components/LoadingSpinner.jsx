function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-r-transparent" />
    </div>
  )
}

export default LoadingSpinner
