/**
 * comprovanteService — Comprovante de Meia-Entrada centralizado no perfil.
 *
 * Fluxo: usuário faz upload → master aprova com validade → checkout verifica elegibilidade.
 * Cache local síncrono + refresh async (padrão dos outros services).
 */

import { supabase } from '../../../services/supabaseClient';
import type { Database } from '../../../types/supabase';
import type { ComprovanteMeia, ComprovanteFoto, StatusComprovante } from '../../../types';

type ComprovanteRow = Database['public']['Tables']['comprovantes_meia']['Row'];

import { tsBR } from '../../../utils';
import { compressImage } from '../../../modules/profile/utils/imageUtils';

const BUCKET = 'comprovantes-meia';

// ── Cache ──────────────────────────────────────────────────────────────────────
let _cache: Map<string, ComprovanteMeia> = new Map();
let _version = 0;
const bump = () => {
  _version++;
};
export const getVersion = () => _version;

// ── Mapper ─────────────────────────────────────────────────────────────────────
const parseFotos = (raw: unknown): ComprovanteFoto[] => {
  if (Array.isArray(raw)) return raw as ComprovanteFoto[];
  return [];
};

const mapRow = (row: ComprovanteRow): ComprovanteMeia => ({
  id: row.id,
  userId: row.user_id,
  tipo: row.tipo,
  fotoUrl: row.foto_url,
  fotos: parseFotos(row.fotos),
  status: row.status as StatusComprovante,
  motivoRejeicao: row.motivo_rejeicao ?? undefined,
  aprovadoPor: row.aprovado_por ?? undefined,
  aprovadoEm: row.aprovado_em ?? undefined,
  validadeAte: row.validade_ate ?? undefined,
  criadoEm: row.criado_em,
});

// ── Helpers de Storage ─────────────────────────────────────────────────────────
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return new Blob([buffer], { type: mime });
};

// ── API Pública ────────────────────────────────────────────────────────────────

export const comprovanteService = {
  /** Retorna comprovante do cache (síncrono) */
  getComprovante(userId: string): ComprovanteMeia | null {
    return _cache.get(userId) ?? null;
  },

  /** Carrega comprovante do Supabase para o cache */
  async refresh(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase.from('comprovantes_meia').select('*').eq('user_id', userId).maybeSingle();

      if (error) {
        console.error('[comprovanteService] refresh:', error);
        return;
      }

      if (data) {
        const comp = mapRow(data);
        // Verificar se venceu
        if (comp.status === 'APROVADO' && comp.validadeAte) {
          const agora = new Date();
          const validade = new Date(comp.validadeAte);
          if (agora > validade) {
            comp.status = 'VENCIDO';
            // Atualiza no banco também
            void supabase
              .from('comprovantes_meia')
              .update({ status: 'VENCIDO', atualizado_em: tsBR() })
              .eq('id', comp.id);
          }
        }
        _cache.set(userId, comp);
      } else {
        _cache.delete(userId);
      }
      bump();
    } catch (err) {
      console.error('[comprovanteService] refresh error:', err);
    }
  },

  /** Verifica se usuário é elegível para meia-entrada */
  isElegivel(userId: string, tipoExigido?: string | null): boolean {
    const comp = _cache.get(userId);
    if (!comp || comp.status !== 'APROVADO') return false;

    // Verificar validade (0 = ilimitado)
    if (comp.validadeAte) {
      const agora = new Date();
      const validade = new Date(comp.validadeAte);
      if (agora > validade) return false;
    }

    // Se tipo específico exigido, verificar match
    if (tipoExigido && comp.tipo !== tipoExigido) return false;

    return true;
  },

  /**
   * Upload de comprovante (múltiplos arquivos) + upsert no banco.
   * @param arquivos - Array de { label, dataUrl } (frente, verso, extra)
   */
  async uploadComprovante(
    userId: string,
    tipo: string,
    arquivos: { label: string; dataUrl: string }[],
  ): Promise<ComprovanteMeia> {
    if (arquivos.length === 0) throw new Error('Nenhum arquivo enviado');

    // 1. Upload de cada arquivo para Storage
    const fotos: ComprovanteFoto[] = [];
    for (const arq of arquivos) {
      const ext = arq.dataUrl.startsWith('data:application/pdf') ? 'pdf' : 'jpg';
      const contentType = ext === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const path = `${userId}/${arq.label}.${ext}`;

      // Remover anterior se existir
      await supabase.storage
        .from(BUCKET)
        .remove([path])
        .catch(() => {});

      const finalDataUrl = ext === 'jpg' ? await compressImage(arq.dataUrl, 1200, 0.78) : arq.dataUrl;
      const blob = dataUrlToBlob(finalDataUrl);
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType, upsert: true });

      if (uploadErr) throw new Error(`Upload (${arq.label}) falhou: ${uploadErr.message}`);
      fotos.push({ label: arq.label, path });
    }

    // 2. Gerar signed URL da primeira foto (legado: foto_url)
    const { data: signedData } = await supabase.storage.from(BUCKET).createSignedUrl(fotos[0].path, 60 * 60 * 24 * 365);

    const fotoUrl = signedData?.signedUrl ?? fotos[0].path;

    // 3. Upsert no banco
    const agora = tsBR();
    const { data, error } = await supabase
      .from('comprovantes_meia')
      .upsert(
        {
          user_id: userId,
          tipo,
          foto_url: fotoUrl,
          fotos: JSON.parse(JSON.stringify(fotos)),
          status: 'PENDENTE',
          motivo_rejeicao: null,
          aprovado_por: null,
          aprovado_em: null,
          validade_ate: null,
          criado_em: agora,
          atualizado_em: agora,
        },
        { onConflict: 'user_id' },
      )
      .select('*')
      .single();

    if (error || !data) throw new Error(`Erro ao salvar: ${error?.message}`);

    const comp = mapRow(data);
    _cache.set(userId, comp);
    bump();

    // 4. Notificar master
    try {
      const { notificationsService } = await import('./notificationsService');
      const { data: masters } = await supabase.from('profiles').select('id').eq('role', 'vanta_masteradm');

      if (masters) {
        for (const m of masters) {
          void notificationsService.add(
            {
              tipo: 'SISTEMA',
              titulo: 'Novo comprovante de meia-entrada',
              mensagem: `Comprovante (${tipo}) aguardando aprovação.`,
              link: 'GESTAO_COMPROVANTES',
              lida: false,
              timestamp: tsBR(),
            },
            m.id as string,
          );
        }
      }
    } catch {
      /* silencioso */
    }

    return comp;
  },

  /** Master: lista comprovantes pendentes */
  async getComprovantesPendentes(): Promise<ComprovanteMeia[]> {
    const { data, error } = await supabase
      .from('comprovantes_meia')
      .select('*, profiles!user_id(nome, email)')
      .eq('status', 'PENDENTE')
      .order('criado_em', { ascending: true })
      .limit(1000);

    if (error || !data) return [];
    return data.map((row: any) => ({
      ...mapRow(row),
      _userName: row.profiles?.nome as string,
      _userEmail: row.profiles?.email as string,
    }));
  },

  /** Master: lista todos os comprovantes */
  async getTodosComprovantes(): Promise<ComprovanteMeia[]> {
    const { data, error } = await supabase
      .from('comprovantes_meia')
      .select('*, profiles!user_id(nome, email)')
      .order('criado_em', { ascending: false })
      .limit(1000);

    if (error || !data) return [];
    return data.map((row: any) => ({
      ...mapRow(row),
      _userName: row.profiles?.nome as string,
      _userEmail: row.profiles?.email as string,
    }));
  },

  /** Master: aprova comprovante e define validade */
  async aprovarComprovante(id: string, validadeMeses: number, masterId: string): Promise<void> {
    const agora = tsBR();
    const validadeAte =
      validadeMeses > 0
        ? new Date(Date.now() + validadeMeses * 30 * 24 * 3600000 - 3 * 3600000).toISOString().replace('Z', '-03:00')
        : null; // 0 = ilimitado

    const { error } = await supabase
      .from('comprovantes_meia')
      .update({
        status: 'APROVADO',
        aprovado_por: masterId,
        aprovado_em: agora,
        validade_ate: validadeAte,
        motivo_rejeicao: null,
        atualizado_em: agora,
      })
      .eq('id', id);

    if (error) throw new Error(`Erro ao aprovar: ${error.message}`);

    // Notificar usuário
    try {
      const { data: comp } = await supabase
        .from('comprovantes_meia')
        .select('user_id, tipo')
        .eq('id', id)
        .maybeSingle();

      if (comp) {
        const { notificationsService } = await import('./notificationsService');
        void notificationsService.add(
          {
            tipo: 'SISTEMA',
            titulo: 'Comprovante aprovado!',
            mensagem: `Seu comprovante de ${comp.tipo} foi aprovado. Agora você pode comprar ingressos meia-entrada.`,
            link: '',
            lida: false,
            timestamp: tsBR(),
          },
          comp.user_id as string,
        );
      }
    } catch {
      /* silencioso */
    }

    bump();
  },

  /** Master: rejeita comprovante com motivo */
  async rejeitarComprovante(id: string, motivo: string): Promise<void> {
    const agora = tsBR();
    const { error } = await supabase
      .from('comprovantes_meia')
      .update({
        status: 'REJEITADO',
        motivo_rejeicao: motivo,
        atualizado_em: agora,
      })
      .eq('id', id);

    if (error) throw new Error(`Erro ao rejeitar: ${error.message}`);

    // Notificar usuário
    try {
      const { data: comp } = await supabase
        .from('comprovantes_meia')
        .select('user_id, tipo')
        .eq('id', id)
        .maybeSingle();

      if (comp) {
        const { notificationsService } = await import('./notificationsService');
        void notificationsService.add(
          {
            tipo: 'SISTEMA',
            titulo: 'Comprovante não aprovado',
            mensagem: `Seu comprovante de ${comp.tipo} foi recusado: ${motivo}. Envie um novo documento.`,
            link: '',
            lida: false,
            timestamp: tsBR(),
          },
          comp.user_id as string,
        );
      }
    } catch {
      /* silencioso */
    }

    bump();
  },

  /** Gera signed URL para a primeira foto (legado/compat) */
  async getFotoUrl(userId: string): Promise<string | null> {
    const comp = _cache.get(userId);
    const fotos = comp?.fotos ?? [];
    if (fotos.length > 0) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(fotos[0].path, 60 * 60);
      return data?.signedUrl ?? null;
    }
    // Fallback legado
    const path = `${userId}/doc.jpg`;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  },

  /** Gera signed URLs para TODOS os arquivos do comprovante */
  async getFotoUrls(userId: string): Promise<{ label: string; url: string }[]> {
    const comp = _cache.get(userId);
    const fotos = comp?.fotos ?? [];
    if (fotos.length === 0) {
      // Fallback legado: tentar doc.jpg
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(`${userId}/doc.jpg`, 60 * 60);
      return data?.signedUrl ? [{ label: 'frente', url: data.signedUrl }] : [];
    }
    const result: { label: string; url: string }[] = [];
    for (const f of fotos) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(f.path, 60 * 60);
      if (data?.signedUrl) result.push({ label: f.label, url: data.signedUrl });
    }
    return result;
  },

  /** Dias restantes de validade (< 0 = vencido, null = ilimitado) */
  diasRestantes(userId: string): number | null {
    const comp = _cache.get(userId);
    if (!comp || comp.status !== 'APROVADO' || !comp.validadeAte) return null;
    const diff = new Date(comp.validadeAte).getTime() - Date.now();
    return Math.ceil(diff / (24 * 3600000));
  },
};
