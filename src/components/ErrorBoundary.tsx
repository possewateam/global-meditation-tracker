import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-white/80 mb-4">
              The application encountered an error. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-200 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
