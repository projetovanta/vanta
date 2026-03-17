/**
 * legalService — Documentos legais editáveis + consentimentos.
 */
import { supabase } from '../../../services/supabaseClient';

export interface LegalDocument {
  id: string;
  tipo: string;
  versao: number;
  conteudo: string;
  publicado: boolean;
  publicadoEm: string | null;
}

export const legalService = {
  /** Buscar documento publicado mais recente por tipo */
  async getPublicado(tipo: string): Promise<LegalDocument | null> {
    const { data } = await supabase
      .from('legal_documents')
      .select('id, tipo, versao, conteudo, publicado, publicado_em')
      .eq('tipo', tipo)
      .eq('publicado', true)
      .order('versao', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      tipo: data.tipo,
      versao: data.versao,
      conteudo: data.conteudo,
      publicado: data.publicado,
      publicadoEm: data.publicado_em,
    };
  },

  /** Buscar todas as versões de um tipo */
  async getVersoes(tipo: string): Promise<LegalDocument[]> {
    const { data } = await supabase
      .from('legal_documents')
      .select('id, tipo, versao, conteudo, publicado, publicado_em')
      .eq('tipo', tipo)
      .order('versao', { ascending: false });
    return (data ?? []).map(d => ({
      id: d.id,
      tipo: d.tipo,
      versao: d.versao,
      conteudo: d.conteudo,
      publicado: d.publicado,
      publicadoEm: d.publicado_em,
    }));
  },

  /** Criar nova versão (rascunho) */
  async criarVersao(tipo: string, conteudo: string, userId: string): Promise<string | null> {
    // Pegar última versão
    const { data: last } = await supabase
      .from('legal_documents')
      .select('versao')
      .eq('tipo', tipo)
      .order('versao', { ascending: false })
      .limit(1)
      .maybeSingle();
    const novaVersao = (last?.versao ?? 0) + 1;
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    const { data, error } = await supabase
      .from('legal_documents')
      .insert({ tipo, versao: novaVersao, conteudo, criado_por: userId, criado_em: now })
      .select('id')
      .single();
    if (error) {
      console.error('[legal] criarVersao:', error);
      return null;
    }
    return data.id;
  },

  /** Publicar versão (despublica anteriores) */
  async publicar(id: string, userId: string): Promise<boolean> {
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T') + '-03:00';
    // Pegar tipo do documento
    const { data: doc } = await supabase.from('legal_documents').select('tipo').eq('id', id).single();
    if (!doc) return false;
    // Despublicar anteriores
    await supabase.from('legal_documents').update({ publicado: false }).eq('tipo', doc.tipo);
    // Publicar este
    const { error } = await supabase
      .from('legal_documents')
      .update({ publicado: true, publicado_em: now, publicado_por: userId })
      .eq('id', id);
    return !error;
  },

  /** Registrar consentimento do usuário */
  async registrarConsentimento(userId: string, tipo: string, versao: number): Promise<boolean> {
    const { error } = await supabase
      .from('user_consents')
      .insert({ user_id: userId, documento_tipo: tipo, documento_versao: versao });
    return !error;
  },

  /** Verificar se usuário aceitou versão atual */
  async verificarConsentimento(userId: string, tipo: string): Promise<boolean> {
    const doc = await this.getPublicado(tipo);
    if (!doc) return true; // sem documento = sem obrigação
    const { data } = await supabase
      .from('user_consents')
      .select('id')
      .eq('user_id', userId)
      .eq('documento_tipo', tipo)
      .eq('documento_versao', doc.versao)
      .limit(1)
      .maybeSingle();
    return !!data;
  },
};
