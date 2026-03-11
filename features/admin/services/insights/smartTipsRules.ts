/**
 * Smart Tips Rules Engine
 * Regras contextuais que geram dicas acionaveis para produtores.
 * Consome dados dos modulos A (Insights) e B (Financial).
 */

import type { SmartTip, TipPriority, TipCategory } from './valueTypes';
import type { NoShowAnalysis } from './insightsTypes';
import type { PricingSuggestion, BreakEvenResult } from './financialTypes';

// ── Context ──

export interface TipContext {
  noShow?: NoShowAnalysis;
  pricing?: PricingSuggestion | null;
  breakEven?: BreakEvenResult | null;
  ticketMedio?: number;
  checkinRate?: number;
  vendidoPercent?: number;
  diasParaEvento?: number;
  topPromoterConversao?: number; // best promoter conversion rate
  cortesiasPercent?: number; // cortesias / total tickets %
}

// ── Helpers ──

const PRIORITY_ORDER: Record<TipPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function tip(
  id: string,
  categoria: TipCategory,
  prioridade: TipPriority,
  titulo: string,
  descricao: string,
  dado: string,
  acao?: string,
): SmartTip {
  return { id, categoria, prioridade, titulo, descricao, dado, ...(acao ? { acao } : {}) };
}

// ── Rules ──

function rulePricingSubir(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.pricing?.acao !== 'SUBIR') return;
  out.push(
    tip(
      'pricing-subir',
      'PRICING',
      'HIGH',
      'Hora de subir o preco',
      'As vendas estao acima da curva esperada. Aproveite a demanda e ajuste o valor do proximo lote.',
      `Velocidade ${ctx.pricing.velocidadeRelativa.toFixed(1)}x acima do normal`,
      'Ajustar preco',
    ),
  );
}

function rulePricingDescontar(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.pricing?.acao !== 'DESCONTAR') return;
  out.push(
    tip(
      'pricing-descontar',
      'PRICING',
      'HIGH',
      'Considere um desconto relampago',
      'As vendas estao abaixo do esperado para esse momento. Uma promocao rapida pode destravar o lote.',
      `Velocidade ${ctx.pricing.velocidadeRelativa.toFixed(1)}x abaixo do esperado`,
      'Criar cupom',
    ),
  );
}

function ruleNoShowAlto(ctx: TipContext, out: SmartTip[]): void {
  if (!ctx.noShow || ctx.noShow.taxaNoShow <= 20) return;
  out.push(
    tip(
      'noshow-alto',
      'OPERACAO',
      'MEDIUM',
      'No-show acima de 20%',
      'Muita gente comprou e nao apareceu. Envie lembretes na vespera e confirme presenca por push.',
      `${ctx.noShow.taxaNoShow.toFixed(0)}% de no-show (${ctx.noShow.totalNoShow} pessoas)`,
      'Enviar lembrete',
    ),
  );
}

function ruleNoShowPromoter(ctx: TipContext, out: SmartTip[]): void {
  const worst = ctx.noShow?.porPromoter?.find(p => p.taxa > 40);
  if (!worst) return;
  out.push(
    tip(
      'noshow-promoter',
      'PUBLICO',
      'MEDIUM',
      'Promoter com no-show alto',
      `${worst.promoterNome} tem ${worst.taxa.toFixed(0)}% de no-show. Avalie a qualidade dos convidados antes de renovar a parceria.`,
      `${worst.noShows} de ${worst.convidados} nao compareceram`,
    ),
  );
}

function ruleBreakEvenPerto(ctx: TipContext, out: SmartTip[]): void {
  const be = ctx.breakEven;
  if (!be || be.atingido || be.ingressosFaltam <= 0 || be.ingressosFaltam >= 20) return;
  out.push(
    tip(
      'breakeven-perto',
      'FINANCEIRO',
      'HIGH',
      'Quase no break-even!',
      `Faltam apenas ${be.ingressosFaltam} ingressos pra cobrir todos os custos. Uma ultima acao de divulgacao pode garantir o lucro.`,
      `${be.percentProgresso.toFixed(0)}% do break-even atingido`,
      'Impulsionar vendas',
    ),
  );
}

function ruleBreakEvenAtingido(ctx: TipContext, out: SmartTip[]): void {
  if (!ctx.breakEven?.atingido) return;
  out.push(
    tip(
      'breakeven-atingido',
      'FINANCEIRO',
      'LOW',
      'Break-even atingido!',
      'Parabens! A partir de agora cada ingresso vendido e lucro liquido. Continue divulgando.',
      `Custos cobertos com ${ctx.breakEven.ingressosVendidos} ingressos`,
    ),
  );
}

function ruleVendasLentas(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.vendidoPercent == null || ctx.diasParaEvento == null || ctx.vendidoPercent >= 30 || ctx.diasParaEvento >= 7)
    return;
  out.push(
    tip(
      'vendas-lentas',
      'MARKETING',
      'HIGH',
      'Vendas precisam de atencao urgente',
      `Menos de 30% vendido e faltam ${ctx.diasParaEvento} dias. Ative promoters, crie cupons ou faca uma blitz nas redes.`,
      `${ctx.vendidoPercent.toFixed(0)}% vendido a ${ctx.diasParaEvento} dias do evento`,
      'Ver acoes',
    ),
  );
}

function ruleCheckinBaixo(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.checkinRate == null || ctx.checkinRate >= 60) return;
  out.push(
    tip(
      'checkin-baixo',
      'OPERACAO',
      'MEDIUM',
      'Taxa de check-in baixa',
      'Menos de 60% do publico fez check-in. Verifique se a portaria esta fluindo e se os QR codes estao funcionando.',
      `${ctx.checkinRate.toFixed(0)}% de check-in`,
    ),
  );
}

function ruleCortesiasExcessivas(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.cortesiasPercent == null || ctx.cortesiasPercent <= 25) return;
  out.push(
    tip(
      'cortesias-excessivas',
      'FINANCEIRO',
      'MEDIUM',
      'Muitas cortesias emitidas',
      `${ctx.cortesiasPercent.toFixed(0)}% dos ingressos sao cortesia. Revise a politica pra nao comprometer a receita.`,
      `${ctx.cortesiasPercent.toFixed(0)}% do total`,
    ),
  );
}

function rulePromoterDestaque(ctx: TipContext, out: SmartTip[]): void {
  if (ctx.topPromoterConversao == null || ctx.topPromoterConversao <= 80) return;
  out.push(
    tip(
      'promoter-destaque',
      'PUBLICO',
      'LOW',
      'Promoter destaque identificado',
      `Seu melhor promoter converteu ${ctx.topPromoterConversao.toFixed(0)}% dos convidados. Considere bonificar pra manter a parceria.`,
      `${ctx.topPromoterConversao.toFixed(0)}% de conversao`,
      'Ver promoter',
    ),
  );
}

// ── Engine ──

const ALL_RULES = [
  rulePricingSubir,
  rulePricingDescontar,
  ruleNoShowAlto,
  ruleNoShowPromoter,
  ruleBreakEvenPerto,
  ruleBreakEvenAtingido,
  ruleVendasLentas,
  ruleCheckinBaixo,
  ruleCortesiasExcessivas,
  rulePromoterDestaque,
];

export function generateTips(context: TipContext): SmartTip[] {
  const tips: SmartTip[] = [];
  for (const rule of ALL_RULES) {
    rule(context, tips);
  }
  tips.sort((a, b) => PRIORITY_ORDER[a.prioridade] - PRIORITY_ORDER[b.prioridade]);
  return tips;
}
