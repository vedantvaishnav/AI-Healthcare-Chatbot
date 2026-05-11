import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-slate-50 px-4 py-10">
          <div className="max-w-lg rounded-[2rem] border border-rose-200 bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-semibold text-slate-950">Something went wrong</h1>
            <p className="mt-4 text-sm text-slate-600">
              We encountered an unexpected error while loading this page. Please refresh the page or try again later.
            </p>
            <pre className="mt-4 whitespace-pre-wrap rounded-3xl bg-slate-100 p-4 text-xs text-slate-700">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
