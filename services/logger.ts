/**
 * logger — wrapper sobre console + Sentry.
 * Em produção: erros vão pro Sentry. Em dev: console normal.
 * Uso: import { logger } from '../services/logger';
 *       logger.error('[modulo] mensagem', error);
 */

import * as Sentry from '@sentry/react';

const isProd = import.meta.env.PROD;

export const logger = {
  error(message: string, error?: unknown) {
    if (isProd) {
      Sentry.captureException(error instanceof Error ? error : new Error(message), {
        extra: { message },
      });
    }
    console.error(message, error ?? '');
  },

  warn(message: string, data?: unknown) {
    if (isProd) {
      Sentry.addBreadcrumb({ category: 'warning', message, level: 'warning', data: data as Record<string, unknown> });
    }
    console.warn(message, data ?? '');
  },

  info(message: string, data?: unknown) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.info(message, data ?? '');
    }
  },
};
