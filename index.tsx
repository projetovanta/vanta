import './app.css';

// Sentry lazy — carrega após o primeiro render pra não bloquear o boot (-316KB)
setTimeout(() => import('./instrument'), 2000);
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Não foi possível encontrar o elemento raiz para montar o aplicativo.');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>,
);
