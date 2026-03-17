/**
 * lgpdExportService — Exportação de dados pessoais (LGPD Art. 18, V)
 * Usa RPC exportar_dados_usuario() — 1 chamada, tudo no banco.
 */

import { supabase } from './supabaseClient';

export interface DadosExportados {
  perfil: Record<string, unknown> | null;
  tickets: Record<string, unknown>[];
  transacoes: Record<string, unknown>[];
  notificacoes: Record<string, unknown>[];
  amizades: Record<string, unknown>[];
  consentimentos: Record<string, unknown>[];
  eventos_favoritos: Record<string, unknown>[];
  comunidades_seguidas: Record<string, unknown>[];
  exportado_em: string;
}

function dataBR(): string {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
}

export const lgpdExportService = {
  async exportarMeusDados(): Promise<DadosExportados> {
    const { data, error } = await supabase.rpc('exportar_dados_usuario');
    if (error) throw new Error(`Erro ao exportar dados: ${error.message}`);
    return data as unknown as DadosExportados;
  },

  downloadJSON(dados: DadosExportados): void {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-dados-vanta-${dataBR().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
