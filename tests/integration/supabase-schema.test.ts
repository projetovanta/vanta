/**
 * Testes de integracao: verifica que o schema do Supabase esta correto.
 * Roda contra o banco REAL — sem mocks.
 */
import { describe, it, expect } from 'vitest';
import { supabase } from './supabaseTestClient';

const TABELAS_OBRIGATORIAS = [
  'profiles',
  'eventos_admin',
  'comunidades',
  'tickets_caixa',
  'lotes',
  'variacoes_ingresso',
  'vendas_log',
  'listas_evento',
  'regras_lista',
  'convidados_lista',
  'notifications',
  'push_subscriptions',
  'friendships',
  'messages',
  'atribuicoes_rbac',
  'transactions',
  'reembolsos',
  'solicitacoes_saque',
  'cortesias_config',
  'cortesias_log',
  'cortesias_pendentes',
  'cupons',
  'mesas',
  'equipe_evento',
  'waitlist',
  'transferencias_ingresso',
  'evento_favoritos',
  'community_follows',
  'reviews_evento',
  'audit_logs',
  'analytics_events',
  'categorias_evento',
  'estilos',
  'formatos',
  'experiencias',
  'interesses',
  'comprovantes_meia',
  'chargebacks',
  'cotas_promoter',
  'pagamentos_promoter',
  'vanta_indica',
  'niveis_prestigio',
  'soberania_acesso',
  // MAIS VANTA
  'mais_vanta_config',
  'clube_config',
  'planos_mais_vanta',
  'tiers_mais_vanta',
  'mais_vanta_lotes_evento',
  'solicitacoes_clube',
  'membros_clube',
  'assinaturas_mais_vanta',
  'infracoes_mais_vanta',
  'resgates_mv_evento',
  'passport_aprovacoes',
];

describe('Schema — tabelas obrigatorias', () => {
  it('todas as tabelas existem no banco', async () => {
    for (const tabela of TABELAS_OBRIGATORIAS) {
      const { error } = await supabase.from(tabela).select('*').limit(0);
      expect(error, `Tabela "${tabela}" nao existe ou RLS bloqueou: ${error?.message}`).toBeNull();
    }
  });
});

describe('Schema — colunas criticas profiles', () => {
  it('profiles tem colunas essenciais', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, email, cidade, estado, instagram, avatar_url, biografia, genero, data_nascimento')
      .limit(1);
    expect(error).toBeNull();
    // Pode retornar 0 linhas mas select nao deve dar erro de coluna
  });
});

describe('Schema — colunas criticas eventos_admin', () => {
  it('eventos_admin tem colunas essenciais', async () => {
    const { data, error } = await supabase
      .from('eventos_admin')
      .select('id, nome, data_inicio, local, publicado, comunidade_id, slug, foto, descricao')
      .limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas criticas tickets_caixa', () => {
  it('tickets_caixa tem colunas essenciais', async () => {
    const { data, error } = await supabase
      .from('tickets_caixa')
      .select('id, evento_id, variacao_id, valor, email, nome_titular, status, emitido_em')
      .limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas criticas lotes e variacoes', () => {
  it('lotes tem colunas essenciais', async () => {
    const { error } = await supabase.from('lotes').select('id, evento_id, nome, ordem, ativo').limit(1);
    expect(error).toBeNull();
  });

  it('variacoes_ingresso tem colunas essenciais', async () => {
    const { error } = await supabase
      .from('variacoes_ingresso')
      .select('id, lote_id, area, valor, limite, vendidos')
      .limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas criticas listas', () => {
  it('listas_evento tem colunas essenciais', async () => {
    const { error } = await supabase.from('listas_evento').select('id, evento_id, teto_global_total').limit(1);
    expect(error).toBeNull();
  });

  it('regras_lista tem colunas essenciais', async () => {
    const { error } = await supabase.from('regras_lista').select('id, lista_id, label, valor, teto_global').limit(1);
    expect(error).toBeNull();
  });

  it('convidados_lista tem colunas essenciais', async () => {
    const { error } = await supabase
      .from('convidados_lista')
      .select('id, lista_id, regra_id, nome, checked_in')
      .limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas RBAC', () => {
  it('atribuicoes_rbac tem colunas essenciais', async () => {
    const { error } = await supabase
      .from('atribuicoes_rbac')
      .select('id, user_id, cargo, tenant_type, tenant_id')
      .limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas financeiro', () => {
  it('transactions tem colunas essenciais', async () => {
    const { error } = await supabase
      .from('transactions')
      .select('id, evento_id, comprador_id, valor_bruto, status, tipo')
      .limit(1);
    expect(error).toBeNull();
  });

  it('reembolsos tem colunas essenciais', async () => {
    const { error } = await supabase.from('reembolsos').select('id, ticket_id, motivo, status, valor').limit(1);
    expect(error).toBeNull();
  });

  it('solicitacoes_saque tem colunas essenciais', async () => {
    const { error } = await supabase.from('solicitacoes_saque').select('id, produtor_id, valor, status').limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas social', () => {
  it('friendships tem colunas essenciais', async () => {
    const { error } = await supabase.from('friendships').select('id, requester_id, addressee_id, status').limit(1);
    expect(error).toBeNull();
  });

  it('messages tem colunas essenciais', async () => {
    const { error } = await supabase.from('messages').select('id, sender_id, recipient_id, text, created_at').limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — colunas notificacoes e push', () => {
  it('notifications tem colunas essenciais', async () => {
    const { error } = await supabase.from('notifications').select('id, user_id, titulo, mensagem, tipo, lida').limit(1);
    expect(error).toBeNull();
  });

  it('push_subscriptions tem colunas essenciais', async () => {
    const { error } = await supabase.from('push_subscriptions').select('id, user_id, fcm_token').limit(1);
    expect(error).toBeNull();
  });
});

describe('Schema — MAIS VANTA', () => {
  it('clube_config tem colunas essenciais', async () => {
    const { error } = await supabase.from('clube_config').select('id, comunidade_id, prazo_post_horas').limit(1);
    expect(error).toBeNull();
  });

  it('membros_clube tem colunas essenciais', async () => {
    const { error } = await supabase.from('membros_clube').select('id, user_id, tier, ativo').limit(1);
    expect(error).toBeNull();
  });

  it('solicitacoes_clube tem colunas essenciais', async () => {
    const { error } = await supabase
      .from('solicitacoes_clube')
      .select('id, user_id, status, instagram_handle')
      .limit(1);
    expect(error).toBeNull();
  });
});
