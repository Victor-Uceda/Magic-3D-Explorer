import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[360px] p-6 text-center bg-slate-900/60 border border-red-500/20 rounded-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/10 animate-pulse">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">
            {this.props.fallbackTitle || 'Ha ocurrido un error inesperado'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.props.fallbackDescription ||
              this.state.error?.message ||
              'No se pudo renderizar este componente correctamente.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
