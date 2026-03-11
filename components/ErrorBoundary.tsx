import React from 'react';
import * as Sentry from '@sentry/react';
import { TYPOGRAPHY } from '../constants';

interface Props {
  children: React.ReactNode;
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

// ErrorBoundary é standalone (tela cheia de fallback) — lint-layout-ok
export class ErrorBoundary extends BaseComponent {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] px-6 text-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mb-6 text-4xl">V</div>
        <h1 className="mb-3 text-lg font-bold text-white/90" style={TYPOGRAPHY.screenTitle}>
          Algo deu errado
        </h1>
        <p className="mb-8 max-w-xs text-sm text-white/50">Ocorreu um erro inesperado. Tente recarregar a página.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#FFD300] px-8 py-3 text-xs font-black uppercase tracking-widest text-black active:scale-95 transition-all"
        >
          Recarregar
        </button>
        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-6 max-w-sm overflow-auto rounded-lg bg-white/5 p-4 text-left text-[0.625rem] text-red-400">
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
