import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  moduleName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Cast necessário: React 19 sem @types/react, Component<P,S> não é tipado
const BaseComponent = React.Component as unknown as new (props: Props) => {
  props: Props;
  state: State;
  setState(s: Partial<State>): void;
  render(): React.ReactNode;
};

/**
 * Error boundary granular por módulo.
 * Captura erros de render e mostra fallback com botão retry.
 * Não derruba o app inteiro — só o módulo afetado.
 */
export class ModuleErrorBoundary extends BaseComponent {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.moduleName}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-900/20 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle size="1.5rem" className="text-red-400" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Algo deu errado</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-xs">
            Ocorreu um erro em {this.props.moduleName}. Tente novamente.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 bg-[#FFD300] text-black px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
          >
            <RefreshCw size="0.875rem" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
