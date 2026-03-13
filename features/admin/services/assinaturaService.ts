/**
 * assinaturaService — Faturamento SaaS MAIS VANTA (MV2).
 * Cada comunidade paga assinatura mensal para ativar o módulo de influência.
 * Planos e regras são dinâmicos — master cria/edita via PlanosMaisVantaView.
 * Stripe integration com PLACEHOLDERs — funciona sem keys configuradas.
 */
import { AssinaturaMaisVanta, PlanoMaisVanta, PlanoMaisVantaDef, StatusAssinatura } from '../../../types';
import { supabase } from '../../../services/supabaseClient';
import type { Database, Json } from '../../../types/supabase';

type PlanoRow = Database['public']['Tables']['planos_mais_vanta']['Row'];
type AssinaturaRow = Database['public']['Tables']['assinaturas_mais_vanta']['Row'];

// ── Cache ─────────────────────────────────────────────────────────────────────
const _assinaturas = new Map<string, AssinaturaMaisVanta>(); // key: comunidadeId
const _planos = new Map<string, PlanoMaisVantaDef>(); // key: plano.id
let _version = 0;
const bump = () => {
  _version++;
};
import { tsBR } from '../../../utils';

const PLANO_LEGACY_MAP: Record<string, { label: string; membros: string; valor: number }> = {
  BASICO: { label: 'Básico', membros: 'Até 50', valor: 199 },
  PRO: { label: 'Pro', membros: 'Até 200', valor: 499 },
  ENTERPRISE: { label: 'Enterprise', membros: 'Ilimitado', valor: 999 },
};

// ── Mappers ────────────────────────────────────────────────────────────────────
const rowToPlano = (r: PlanoRow): PlanoMaisVantaDef => ({
  id: r.id ?? '',
  nome: r.nome ?? '',
  descricao: r.descricao ?? '',
  precoMensal: r.preco_mensal || 0,
  limiteEventosMV: r.limite_eventos_mv ?? 5,
  limiteMembros: r.limite_membros ?? 50,
  limiteVagasEvento: r.limite_vagas_evento ?? 10,
  tierMinimo: r.tier_minimo ?? 'lista',
  acompanhante: r.acompanhante ?? false,
  prazoPostHoras: r.prazo_post_horas ?? 12,
  precoAvulso: r.preco_avulso || 0,
  ativo: r.ativo ?? true,
  destaque: r.destaque ?? false,
  ordem: r.ordem ?? 0,
  criadoEm: r.criado_em ?? '',
  atualizadoEm: r.atualizado_em ?? '',
});

const rowToAssinatura = (r: AssinaturaRow): AssinaturaMaisVanta => ({
  id: r.id ?? '',
  comunidadeId: r.comunidade_id ?? '',
  planoId: r.plano_id ?? undefined,
  plano: (r.plano as PlanoMaisVanta) ?? 'BASICO',
  planoSnapshot: r.plano_snapshot ? (r.plano_snapshot as unknown as PlanoMaisVantaDef) : undefined,
  status: (r.status as StatusAssinatura) ?? 'PENDENTE',
  stripeCustomerId: r.stripe_customer_id ?? undefined,
  stripeSubscriptionId: r.stripe_subscription_id ?? undefined,
  valorMensal: r.valor_mensal || 0,
  eventosMVUsados: r.eventos_mv_usados || 0,
  inicio: r.inicio ?? undefined,
  fim: r.fim ?? undefined,
  criadoEm: r.criado_em ?? '',
  criadoPor: r.criado_por ?? '',
});

// ── Service ───────────────────────────────────────────────────────────────────
export const assinaturaService = {
  getVersion: () => _version,

  // ── Refresh ──────────────────────────────────────────────────────────────
  async refresh(): Promise<void> {
    const [assinRes, planosRes] = await Promise.all([
      supabase.from('assinaturas_mais_vanta').select('*').limit(1000),
      supabase.from('planos_mais_vanta').select('*').order('ordem').limit(100),
    ]);

    _assinaturas.clear();
    if (assinRes.data) {
      for (const r of assinRes.data) {
        const a = rowToAssinatura(r);
        _assinaturas.set(a.comunidadeId, a);
      }
    }

    _planos.clear();
    if (planosRes.data) {
      for (const r of planosRes.data) {
        const p = rowToPlano(r);
        _planos.set(p.id, p);
      }
    }
    bump();
  },

  async refreshPlanos(): Promise<void> {
    const { data } = await supabase.from('planos_mais_vanta').select('*').order('ordem').limit(100);
    _planos.clear();
    if (data) {
      for (const r of data) {
        const p = rowToPlano(r);
        _planos.set(p.id, p);
      }
    }
    bump();
  },

  // ── Planos dinâmicos (CRUD master) ───────────────────────────────────────
  getPlanos(): PlanoMaisVantaDef[] {
    return Array.from(_planos.values())
      .filter(p => p.ativo)
      .sort((a, b) => a.ordem - b.ordem);
  },

  getTodosPlanos(): PlanoMaisVantaDef[] {
    return Array.from(_planos.values()).sort((a, b) => a.ordem - b.ordem);
  },

  getPlano(planoId: string): PlanoMaisVantaDef | null {
    return _planos.get(planoId) ?? null;
  },

  async criarPlano(data: Omit<PlanoMaisVantaDef, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<PlanoMaisVantaDef> {
    const row = {
      nome: data.nome,
      descricao: data.descricao ?? '',
      preco_mensal: data.precoMensal,
      limite_eventos_mv: data.limiteEventosMV,
      limite_membros: data.limiteMembros,
      limite_vagas_evento: data.limiteVagasEvento,
      tier_minimo: data.tierMinimo,
      acompanhante: data.acompanhante,
      prazo_post_horas: data.prazoPostHoras,
      preco_avulso: data.precoAvulso,
      ativo: data.ativo,
      destaque: data.destaque,
      ordem: data.ordem,
    };
    const { data: res, error } = await supabase.from('planos_mais_vanta').insert(row).select().single();
    if (error) throw error;
    const plano = rowToPlano(res);
    _planos.set(plano.id, plano);
    bump();
    return plano;
  },

  async editarPlano(
    planoId: string,
    data: Partial<Omit<PlanoMaisVantaDef, 'id' | 'criadoEm' | 'atualizadoEm'>>,
  ): Promise<void> {
    const row: Record<string, unknown> = { atualizado_em: tsBR() };
    if (data.nome !== undefined) row.nome = data.nome;
    if (data.descricao !== undefined) row.descricao = data.descricao;
    if (data.precoMensal !== undefined) row.preco_mensal = data.precoMensal;
    if (data.limiteEventosMV !== undefined) row.limite_eventos_mv = data.limiteEventosMV;
    if (data.limiteMembros !== undefined) row.limite_membros = data.limiteMembros;
    if (data.limiteVagasEvento !== undefined) row.limite_vagas_evento = data.limiteVagasEvento;
    if (data.tierMinimo !== undefined) row.tier_minimo = data.tierMinimo;
    if (data.acompanhante !== undefined) row.acompanhante = data.acompanhante;
    if (data.prazoPostHoras !== undefined) row.prazo_post_horas = data.prazoPostHoras;
    if (data.precoAvulso !== undefined) row.preco_avulso = data.precoAvulso;
    if (data.ativo !== undefined) row.ativo = data.ativo;
    if (data.destaque !== undefined) row.destaque = data.destaque;
    if (data.ordem !== undefined) row.ordem = data.ordem;

    const { error } = await supabase.from('planos_mais_vanta').update(row).eq('id', planoId);
    if (error) {
      console.error('[assinaturaService] updatePlano:', error);
      return;
    }
    const cached = _planos.get(planoId);
    if (cached) {
      Object.assign(cached, data, { atualizadoEm: row.atualizado_em });
    }
    bump();
  },

  async desativarPlano(planoId: string): Promise<{ ok: boolean; reason?: string }> {
    // Guard: verificar se tem assinantes ativos com esse plano
    const ativos = Array.from(_assinaturas.values()).filter(a => a.planoId === planoId && a.status === 'ATIVA');
    if (ativos.length > 0) {
      return { ok: false, reason: `${ativos.length} assinante(s) ativo(s) neste plano. Não é possível desativar.` };
    }
    const { error } = await supabase
      .from('planos_mais_vanta')
      .update({ ativo: false, atualizado_em: tsBR() })
      .eq('id', planoId);
    if (error) {
      console.error('[assinaturaService] desativarPlano:', error);
      return { ok: false, reason: 'Erro ao desativar plano.' };
    }
    const cached = _planos.get(planoId);
    if (cached) cached.ativo = false;
    bump();
    return { ok: true };
  },

  /** Conta assinantes ativos de um plano */
  getAssinantesPlano(planoId: string): number {
    return Array.from(_assinaturas.values()).filter(a => a.planoId === planoId && a.status === 'ATIVA').length;
  },

  // ── Assinaturas ─────────────────────────────────────────────────────────
  getAssinatura(comunidadeId: string): AssinaturaMaisVanta | null {
    return _assinaturas.get(comunidadeId) ?? null;
  },

  isAtiva(comunidadeId: string): boolean {
    const a = _assinaturas.get(comunidadeId);
    return a?.status === 'ATIVA';
  },

  getTodasAssinaturas(): AssinaturaMaisVanta[] {
    return Array.from(_assinaturas.values());
  },

  /** Resolve info do plano: tenta plano dinâmico, fallback snapshot, fallback legado */
  getInfoPlano(assinatura: AssinaturaMaisVanta): { nome: string; membros: string; valor: number } {
    // 1. Plano dinâmico pelo ID
    if (assinatura.planoId) {
      const p = _planos.get(assinatura.planoId);
      if (p)
        return {
          nome: p.nome,
          membros: p.limiteMembros === -1 ? 'Ilimitado' : `Até ${p.limiteMembros}`,
          valor: p.precoMensal,
        };
    }
    // 2. Snapshot congelado
    if (assinatura.planoSnapshot) {
      const s = assinatura.planoSnapshot;
      return {
        nome: s.nome,
        membros: s.limiteMembros === -1 ? 'Ilimitado' : `Até ${s.limiteMembros}`,
        valor: s.precoMensal,
      };
    }
    // 3. Fallback legado
    const legacy = PLANO_LEGACY_MAP[assinatura.plano];
    return { nome: legacy?.label ?? assinatura.plano, membros: legacy?.membros ?? '?', valor: legacy?.valor ?? 0 };
  },

  // ── Contadores MV ──────────────────────────────────────────────────────
  getEventosMVUsados(comunidadeId: string): number {
    const a = _assinaturas.get(comunidadeId);
    return a?.eventosMVUsados ?? 0;
  },

  getLimiteEventosMV(comunidadeId: string): number {
    const a = _assinaturas.get(comunidadeId);
    if (!a) return 0;
    // Usa snapshot (regras travadas na assinatura) se disponível
    if (a.planoSnapshot) return a.planoSnapshot.limiteEventosMV;
    if (a.planoId) {
      const p = _planos.get(a.planoId);
      if (p) return p.limiteEventosMV;
    }
    return 0; // sem plano resolvido = sem cota
  },

  cotaDisponivel(comunidadeId: string): boolean {
    const limite = this.getLimiteEventosMV(comunidadeId);
    if (limite === -1) return true; // ilimitado
    return this.getEventosMVUsados(comunidadeId) < limite;
  },

  async incrementarEventosMV(comunidadeId: string): Promise<void> {
    const a = _assinaturas.get(comunidadeId);
    if (!a) return;
    const novo = (a.eventosMVUsados ?? 0) + 1;
    const { error } = await supabase
      .from('assinaturas_mais_vanta')
      .update({ eventos_mv_usados: novo })
      .eq('comunidade_id', comunidadeId);
    if (error) {
      console.error('[assinaturaService] incrementarEventosMV:', error);
      return;
    }
    a.eventosMVUsados = novo;
    bump();
  },

  async decrementarEventosMV(comunidadeId: string): Promise<void> {
    const a = _assinaturas.get(comunidadeId);
    if (!a) return;
    const novo = Math.max(0, (a.eventosMVUsados ?? 0) - 1);
    const { error } = await supabase
      .from('assinaturas_mais_vanta')
      .update({ eventos_mv_usados: novo })
      .eq('comunidade_id', comunidadeId);
    if (error) {
      console.error('[assinaturaService] decrementarEventosMV:', error);
      return;
    }
    a.eventosMVUsados = novo;
    bump();
  },

  // ── CRUD Assinaturas ───────────────────────────────────────────────────
  async criarAssinatura(comunidadeId: string, planoId: string, userId: string): Promise<AssinaturaMaisVanta> {
    const planoDef = _planos.get(planoId);
    if (!planoDef) throw new Error('Plano não encontrado');

    const row = {
      comunidade_id: comunidadeId,
      plano_id: planoId,
      plano: planoDef.nome
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s/g, '_') as PlanoMaisVanta,
      plano_snapshot: planoDef as unknown as Json,
      status: 'PENDENTE',
      valor_mensal: planoDef.precoMensal,
      eventos_mv_usados: 0,
      criado_em: tsBR(),
      criado_por: userId,
    };
    const { data, error } = await supabase.from('assinaturas_mais_vanta').insert(row).select().single();
    if (error) throw error;
    const a = rowToAssinatura(data);
    _assinaturas.set(comunidadeId, a);
    bump();
    return a;
  },

  async ativarAssinatura(comunidadeId: string): Promise<void> {
    const now = tsBR();
    await supabase
      .from('assinaturas_mais_vanta')
      .update({
        status: 'ATIVA',
        inicio: now,
      })
      .eq('comunidade_id', comunidadeId);

    const a = _assinaturas.get(comunidadeId);
    if (a) {
      a.status = 'ATIVA';
      a.inicio = now;
    }
    bump();
  },

  async cancelarAssinatura(comunidadeId: string): Promise<void> {
    await supabase
      .from('assinaturas_mais_vanta')
      .update({
        status: 'CANCELADA',
      })
      .eq('comunidade_id', comunidadeId);

    const a = _assinaturas.get(comunidadeId);
    if (a) a.status = 'CANCELADA';
    bump();
  },

  /**
   * Inicia checkout Stripe via Edge Function.
   * REGRA APPLE: abre em janela externa (navegador) — nunca dentro do app.
   * Se Stripe não configurado → retorna null (placeholder).
   */
  async iniciarCheckout(comunidadeId: string, planoId: string, returnUrl: string): Promise<string | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return null;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comunidadeId, plano: planoId, returnUrl }),
      });

      const json = await res.json();
      if (json.placeholder || !json.url) return null;
      return json.url as string;
    } catch {
      return null;
    }
  },

  /** Compra avulsa de 1 evento MV extra (preço do plano ativo) */
  async comprarAvulso(comunidadeId: string): Promise<{ ok: boolean; preco?: number; reason?: string }> {
    const a = _assinaturas.get(comunidadeId);
    if (!a || a.status !== 'ATIVA') return { ok: false, reason: 'Sem assinatura ativa' };

    // Preço do avulso: snapshot > plano dinâmico > fallback 79
    let preco = 79;
    if (a.planoSnapshot?.precoAvulso !== undefined) {
      preco = a.planoSnapshot.precoAvulso;
    } else if (a.planoId) {
      const p = _planos.get(a.planoId);
      if (p) preco = p.precoAvulso;
    }

    if (preco === 0) {
      // Plano Enterprise (preço avulso = 0) → incrementar direto
      await this.incrementarEventosMV(comunidadeId);
      return { ok: true, preco: 0 };
    }

    // Stripe não integrado — bloqueado até STRIPE_SECRET_KEY ser configurado
    return { ok: false, reason: `Pagamento indisponível — integração Stripe pendente. Valor: R$ ${preco}` };
  },

  /** Preço do avulso para exibir na UI */
  getPrecoAvulso(comunidadeId: string): number {
    const a = _assinaturas.get(comunidadeId);
    if (!a) return 79;
    if (a.planoSnapshot?.precoAvulso !== undefined) return a.planoSnapshot.precoAvulso;
    if (a.planoId) {
      const p = _planos.get(a.planoId);
      if (p) return p.precoAvulso;
    }
    return 79;
  },
};
