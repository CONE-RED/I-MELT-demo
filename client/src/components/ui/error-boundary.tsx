import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-cone-gray bg-cone-black/50 rounded-lg border border-cone-gray/20">
          <AlertTriangle className="w-12 h-12 text-cone-red mb-4" />
          <h2 className="text-lg font-medium mb-2 text-cone-white">Something went wrong</h2>
          <p className="text-sm text-center mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-cone-red hover:bg-cone-red/80 text-white rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}