-- ═══════════════════════════════════════════════════════════════
-- Seed: Bosque Domingo 01/03/2026 — dados reais do AZ List
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Evento ─────────────────────────────────────────────────
INSERT INTO eventos_admin (id, comunidade_id, nome, descricao, data_inicio, data_fim, local, cidade, publicado, caixa_ativo, created_by)
VALUES (
  'a0a0a0a0-0001-4000-8000-000000000001',
  '676f514e-dd2d-5ffa-a570-3aceb385b9b3',
  'Bosque Domingo',
  'Evento dominical Bosque Bar — dados importados do AZ List para demonstração do relatório VANTA.',
  '2026-03-01T22:00:00-03:00',
  '2026-03-02T06:00:00-03:00',
  'Bosque Bar',
  'Juiz de Fora',
  true,
  true,
  'ecee77b5-9edf-4339-99f1-968cd9c5c34b'
)
ON CONFLICT (id) DO NOTHING;

-- ── 1b. Equipe do evento (necessário para RLS) ─────────────────
INSERT INTO equipe_evento (evento_id, membro_id, papel, liberar_lista)
VALUES
  ('a0a0a0a0-0001-4000-8000-000000000001', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', 'GERENTE', true),
  ('a0a0a0a0-0001-4000-8000-000000000001', '6ee39bfb-0251-484d-87b6-4ef46bac740a', 'GERENTE', true),
  ('a0a0a0a0-0001-4000-8000-000000000001', 'deea9896-9a51-4636-b788-be1faf4318b3', 'PORTARIA_LISTA', true)
ON CONFLICT (evento_id, membro_id, papel) DO NOTHING;

-- ── 2. Lista do evento ────────────────────────────────────────
INSERT INTO listas_evento (id, evento_id, teto_global_total)
VALUES (
  'b0b0b0b0-0001-4000-8000-000000000001',
  'a0a0a0a0-0001-4000-8000-000000000001',
  2648
)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Regras de lista ────────────────────────────────────────
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0001-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Banda e Djs', 73, 73, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0002-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Feminino $50 noite toda', 62, 62, '#f472b6', 'F')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0003-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista Amiga -  VIP / R$90 (até às 20h)', 895, 895, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0004-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista Aniversário  amiga Carol Vip até 21:00 após 50/130', 96, 96, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0005-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista Leo Marçal vip', 55, 55, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0006-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista Marcos Noronha (VIP unissex até 22h)', 197, 197, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0007-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista VIP ((SÓCIOS BOSQUE))', 113, 113, '#a78bfa', 'U')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0008-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista VIP feminino', 181, 181, '#f472b6', 'F')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0009-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Lista VIP masculino', 172, 172, '#60a5fa', 'M')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0010-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Masculino $120 (noite toda)', 164, 164, '#60a5fa', 'M')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0011-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'Masculino $150 (noite toda)', 76, 76, '#60a5fa', 'M')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0012-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'VIP feminino até 21h (depois R$50)', 178, 178, '#f472b6', 'F')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0013-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'VIP feminino até 22h (depois R$50)', 164, 164, '#f472b6', 'F')
ON CONFLICT (id) DO NOTHING;
INSERT INTO regras_lista (id, lista_id, label, teto_global, saldo_banco, cor, genero)
VALUES ('c0c0c0c0-0014-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'VIP feminino até 23h (depois R$50)', 422, 422, '#f472b6', 'F')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Convidados ─────────────────────────────────────────────
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0001-4000-8000-000000000001', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Geovanna Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-25T20:59:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0002-4000-8000-000000000002', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Julia Ribeiro Canedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-25T20:59:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0003-4000-8000-000000000003', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Isabel Lacowicz Krautler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-25T23:18:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0004-4000-8000-000000000004', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larissa Karla Lacowicz Krautler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-25T23:18:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0005-4000-8000-000000000005', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Debora Bruna Leite', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-25T23:18:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0006-4000-8000-000000000006', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna Isphair Maziero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-25T23:18:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0007-4000-8000-000000000007', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Miguel Turibio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0008-4000-8000-000000000008', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Arcanjo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0009-4000-8000-000000000009', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jefferson Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0010-4000-8000-000000000010', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yan Ravanetti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0011-4000-8000-000000000011', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrick Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0012-4000-8000-000000000012', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Alberto Pinheiro (aniversariante)', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Elloah Castro', '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0013-4000-8000-000000000013', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Carolina Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0014-4000-8000-000000000014', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Adriane Ximenes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0015-4000-8000-000000000015', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Gabriela Cortes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0016-4000-8000-000000000016', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Gabriella Avelino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0017-4000-8000-000000000017', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Isabelle Panza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0018-4000-8000-000000000018', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Fabielli Montelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0019-4000-8000-000000000019', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Andressa Manhães', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:39:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0020-4000-8000-000000000020', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Nadja Eulália', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:44:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0021-4000-8000-000000000021', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Taynara Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:44:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0022-4000-8000-000000000022', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Karolliny Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-27T19:44:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0023-4000-8000-000000000023', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruno Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0024-4000-8000-000000000024', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alan Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0025-4000-8000-000000000025', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carlos Rodriguez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0026-4000-8000-000000000026', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0027-4000-8000-000000000027', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando Cezar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0028-4000-8000-000000000028', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sandro Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T16:43:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0029-4000-8000-000000000029', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Valeria dos anjos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-02-28T19:11:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0030-4000-8000-000000000030', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Raile souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-02-28T19:11:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0031-4000-8000-000000000031', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Patricia Nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-02-28T19:11:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0032-4000-8000-000000000032', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Carlos Curty', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:12:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0033-4000-8000-000000000033', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Torres Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0034-4000-8000-000000000034', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kieran Hilton', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0035-4000-8000-000000000035', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'ingrid Wimmer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0036-4000-8000-000000000036', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mari Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0037-4000-8000-000000000037', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maristela Scarinci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0038-4000-8000-000000000038', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rosana Figureli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0039-4000-8000-000000000039', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mayreley Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0040-4000-8000-000000000040', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mari Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0041-4000-8000-000000000041', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mayreey Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0042-4000-8000-000000000042', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rosana Figureli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0043-4000-8000-000000000043', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Jose Barbosa da Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T19:13:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0044-4000-8000-000000000044', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Geovana Guedes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-02-28T20:55:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0045-4000-8000-000000000045', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Emilly Buara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T20:55:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0046-4000-8000-000000000046', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nathalia Potyguara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0047-4000-8000-000000000047', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela Beloch', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0048-4000-8000-000000000048', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Débora Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0049-4000-8000-000000000049', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julia mol', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0050-4000-8000-000000000050', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alice Gani', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0051-4000-8000-000000000051', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luana Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T20:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0052-4000-8000-000000000052', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gabriel del Bianco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:00:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0053-4000-8000-000000000053', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gabriel Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:00:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0054-4000-8000-000000000054', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Pedro bumlai', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:00:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0055-4000-8000-000000000055', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amanda Collares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:14:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0056-4000-8000-000000000056', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bruna Epifanio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:14:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0057-4000-8000-000000000057', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Camila Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:14:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0058-4000-8000-000000000058', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Priscila Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:14:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0059-4000-8000-000000000059', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcos Noronha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0060-4000-8000-000000000060', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Carolina Flauzino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0061-4000-8000-000000000061', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Fernando Mora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0062-4000-8000-000000000062', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leon Brum', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0063-4000-8000-000000000063', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Victor Zein', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0064-4000-8000-000000000064', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Carlos Campos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0065-4000-8000-000000000065', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Ivo Doroteia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0066-4000-8000-000000000066', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bárbara Marcolin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0067-4000-8000-000000000067', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'victor santiago', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0068-4000-8000-000000000068', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bruno Motta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0069-4000-8000-000000000069', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Ana Elle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0070-4000-8000-000000000070', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Ely Cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0071-4000-8000-000000000071', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Augusto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0072-4000-8000-000000000072', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bruna Verdi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0073-4000-8000-000000000073', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Jhuana Lamas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0074-4000-8000-000000000074', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Isabella Bianciotto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0075-4000-8000-000000000075', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gustavo Hiroshi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0076-4000-8000-000000000076', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Douglas Asano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0077-4000-8000-000000000077', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Pedro Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0078-4000-8000-000000000078', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Joaquim Vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0079-4000-8000-000000000079', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Alex Ticianelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0080-4000-8000-000000000080', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Maíra de Castro Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0081-4000-8000-000000000081', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Skarllety Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0082-4000-8000-000000000082', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcello Pollo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0083-4000-8000-000000000083', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Filipe Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0084-4000-8000-000000000084', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bruno Fiori', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0085-4000-8000-000000000085', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bruno Romeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0086-4000-8000-000000000086', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Mathias Massoue', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0087-4000-8000-000000000087', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Eduardo Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0088-4000-8000-000000000088', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Diogo Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0089-4000-8000-000000000089', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcos Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0090-4000-8000-000000000090', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gilmar Filho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0091-4000-8000-000000000091', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Paulo Horn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0092-4000-8000-000000000092', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabriela Finimundi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0093-4000-8000-000000000093', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'André Luís dos Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0094-4000-8000-000000000094', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Matheus Alencar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0095-4000-8000-000000000095', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Sandra Couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0096-4000-8000-000000000096', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Agnaldo Vargas Luiz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0097-4000-8000-000000000097', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Michelle Sendin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0098-4000-8000-000000000098', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Nathaly Diniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0099-4000-8000-000000000099', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Muriel Le Senechal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0100-4000-8000-000000000100', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Guilherme Furst', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0101-4000-8000-000000000101', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Raul Vinelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0102-4000-8000-000000000102', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Joabe Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0103-4000-8000-000000000103', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Isabella Lorenzini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0104-4000-8000-000000000104', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Conrado Caon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0105-4000-8000-000000000105', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Isabela Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0106-4000-8000-000000000106', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Filipy de Paula', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0107-4000-8000-000000000107', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Javier Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0108-4000-8000-000000000108', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Yago Leite', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0109-4000-8000-000000000109', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Rafaela Nastrini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0110-4000-8000-000000000110', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Helena Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0111-4000-8000-000000000111', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Kellvyn Jhonys', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0112-4000-8000-000000000112', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Victor Hugo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0113-4000-8000-000000000113', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Raphael Guedes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0114-4000-8000-000000000114', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Tarcizio Tuão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0115-4000-8000-000000000115', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'João Papa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0116-4000-8000-000000000116', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Romulo Guedes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0117-4000-8000-000000000117', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Thaynara Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0118-4000-8000-000000000118', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Luiz Felippe Correia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0119-4000-8000-000000000119', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Bruna Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0120-4000-8000-000000000120', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Juliana Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0121-4000-8000-000000000121', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Enrique Gimenez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0122-4000-8000-000000000122', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Juan David Pascoas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0123-4000-8000-000000000123', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Pedro Vergara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0124-4000-8000-000000000124', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leonardo Salgado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0125-4000-8000-000000000125', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leandro Salgado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0126-4000-8000-000000000126', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Andre Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0127-4000-8000-000000000127', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Luiz Elbert', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0128-4000-8000-000000000128', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Greice Bezerra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0129-4000-8000-000000000129', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Guilherme Abdo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0130-4000-8000-000000000130', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Augusto Antunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0131-4000-8000-000000000131', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'James Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0132-4000-8000-000000000132', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Sammer Sanches', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0133-4000-8000-000000000133', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Andre Suplicy', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0134-4000-8000-000000000134', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Rafael Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0135-4000-8000-000000000135', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'João Bessa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0136-4000-8000-000000000136', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Wesley Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0137-4000-8000-000000000137', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Joao Baldin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0138-4000-8000-000000000138', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Stefano Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0139-4000-8000-000000000139', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Rocío Moitino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0140-4000-8000-000000000140', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Giovana Lucato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0141-4000-8000-000000000141', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Inês Ramalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0142-4000-8000-000000000142', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Raphael Sobral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0143-4000-8000-000000000143', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'inaiara Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0144-4000-8000-000000000144', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Alex miraballes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0145-4000-8000-000000000145', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Lucas Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0146-4000-8000-000000000146', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Paulo Dutra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0147-4000-8000-000000000147', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Lucas Lincoln', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0148-4000-8000-000000000148', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Carolina Mello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0149-4000-8000-000000000149', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Xavier Besseau', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0150-4000-8000-000000000150', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Finn Johanssen', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0151-4000-8000-000000000151', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Josmar Diaz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0152-4000-8000-000000000152', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'André Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0153-4000-8000-000000000153', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Pedro Waite', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0154-4000-8000-000000000154', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Giselle Bernardino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0155-4000-8000-000000000155', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Elaine Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0156-4000-8000-000000000156', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Andresa Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0157-4000-8000-000000000157', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Helena Almeida Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0158-4000-8000-000000000158', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Suellen Romero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0159-4000-8000-000000000159', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabriel Peres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0160-4000-8000-000000000160', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Thamer Romero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0161-4000-8000-000000000161', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Anne Rosales', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0162-4000-8000-000000000162', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Luis Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0163-4000-8000-000000000163', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Neuza Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0164-4000-8000-000000000164', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Arthur Frasson', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0165-4000-8000-000000000165', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leonardo Benites', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0166-4000-8000-000000000166', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Andrea Vianna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0167-4000-8000-000000000167', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Amanda Alexandrini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0168-4000-8000-000000000168', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Irina Molina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0169-4000-8000-000000000169', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Joao Yatudo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0170-4000-8000-000000000170', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Diogo Almeida Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0171-4000-8000-000000000171', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'João Pedro Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0172-4000-8000-000000000172', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Diego Thibaut', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0173-4000-8000-000000000173', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcelo Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0174-4000-8000-000000000174', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Blanka Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0175-4000-8000-000000000175', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Thais Coelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0176-4000-8000-000000000176', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Julyana Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0177-4000-8000-000000000177', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Géssica Bessa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0178-4000-8000-000000000178', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Matheus Aquino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0179-4000-8000-000000000179', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Victor Paim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0180-4000-8000-000000000180', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabrielle Bonoto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0181-4000-8000-000000000181', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Manuella Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0182-4000-8000-000000000182', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcelo Kusnitzki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:28:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0183-4000-8000-000000000183', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andrea Baptista', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:43:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0184-4000-8000-000000000184', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'João Bernardo Baptista', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:43:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0185-4000-8000-000000000185', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Giovanna Kuns', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T21:43:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0186-4000-8000-000000000186', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Santiago Mazzacotte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0187-4000-8000-000000000187', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alexandra Barcovich', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0188-4000-8000-000000000188', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Giménez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0189-4000-8000-000000000189', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alma Moreno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0190-4000-8000-000000000190', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andrey Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0191-4000-8000-000000000191', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anahí Sánchez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-02-28T23:33:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0192-4000-8000-000000000192', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Atila Mariano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T00:27:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0193-4000-8000-000000000193', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Suedivaldo ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T01:20:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0194-4000-8000-000000000194', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Paulo de Tarso da silva e silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T01:35:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0195-4000-8000-000000000195', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Waldson Macedo Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T01:35:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0196-4000-8000-000000000196', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas leandro fontes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T01:35:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0197-4000-8000-000000000197', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel da silva Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T01:35:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0198-4000-8000-000000000198', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Paula Wirz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T02:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0199-4000-8000-000000000199', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caroline Lyra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T02:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0200-4000-8000-000000000200', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luciana Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T02:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0201-4000-8000-000000000201', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Patricia Celestino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T02:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0202-4000-8000-000000000202', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Klem', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0203-4000-8000-000000000203', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcel Faria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0204-4000-8000-000000000204', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Simão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0205-4000-8000-000000000205', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0206-4000-8000-000000000206', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gustavo Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0207-4000-8000-000000000207', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Aparecida Esteves Aviles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0208-4000-8000-000000000208', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tamyres Esteves Aviles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0209-4000-8000-000000000209', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tatiana Nahas Frazão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T06:34:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0210-4000-8000-000000000210', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Monaliza Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T11:25:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0211-4000-8000-000000000211', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Nicole Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T11:25:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0212-4000-8000-000000000212', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Elaine Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T11:25:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0213-4000-8000-000000000213', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Vanessa Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0214-4000-8000-000000000214', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Priscila Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0215-4000-8000-000000000215', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Reis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0216-4000-8000-000000000216', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Távora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0217-4000-8000-000000000217', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Samara Antunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0218-4000-8000-000000000218', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Keyla Waltz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0219-4000-8000-000000000219', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karina Sampaio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0220-4000-8000-000000000220', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karine Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0221-4000-8000-000000000221', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luana Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0222-4000-8000-000000000222', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luana Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0223-4000-8000-000000000223', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Paula Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:22:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0224-4000-8000-000000000224', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Carolina Amorim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0225-4000-8000-000000000225', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Giulia Sarantakos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0226-4000-8000-000000000226', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Fernando Santos costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0227-4000-8000-000000000227', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cassio Netto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0228-4000-8000-000000000228', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dennis Carrijo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0229-4000-8000-000000000229', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcio Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T13:48:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0230-4000-8000-000000000230', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luiza Gomez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T14:14:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0231-4000-8000-000000000231', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natã Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:07:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0232-4000-8000-000000000232', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Mota Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:07:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0233-4000-8000-000000000233', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruno Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:07:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0234-4000-8000-000000000234', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Suelen Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:07:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0235-4000-8000-000000000235', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Fernando Diego de Souza Correia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T15:07:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0236-4000-8000-000000000236', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Milena Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:08:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0237-4000-8000-000000000237', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Kerly Yano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:08:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0238-4000-8000-000000000238', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Laura Pavin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:08:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0239-4000-8000-000000000239', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Alessandra Cesario', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:11:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0240-4000-8000-000000000240', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Giovanna Krumbiegel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:12:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0241-4000-8000-000000000241', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Giulianna Krumbiegel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:12:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0242-4000-8000-000000000242', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Aline Reinozo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:12:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0243-4000-8000-000000000243', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Livia Roque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:12:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0244-4000-8000-000000000244', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alex Glasberg', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:12:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0245-4000-8000-000000000245', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Evenny Portugal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:13:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0246-4000-8000-000000000246', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pietro Sobrinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:13:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0247-4000-8000-000000000247', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabiana Reder', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:13:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0248-4000-8000-000000000248', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Felippe Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:13:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0249-4000-8000-000000000249', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Rayssa Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0250-4000-8000-000000000250', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jeniffer Holanda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0251-4000-8000-000000000251', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Rafaela Mourão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0252-4000-8000-000000000252', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Emanuelle dos santos Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0253-4000-8000-000000000253', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Nicole Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0254-4000-8000-000000000254', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Albiely Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0255-4000-8000-000000000255', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Narian Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0256-4000-8000-000000000256', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Fabiola Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0257-4000-8000-000000000257', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Elisa Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Daniela', '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0258-4000-8000-000000000258', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Janaina Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0259-4000-8000-000000000259', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lika Brandão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:20:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0260-4000-8000-000000000260', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Debora Lana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:25:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0261-4000-8000-000000000261', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Manuela Couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T15:25:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0262-4000-8000-000000000262', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Wermelinger', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:25:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0263-4000-8000-000000000263', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Campos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:25:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0264-4000-8000-000000000264', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:25:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0265-4000-8000-000000000265', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lais Rios', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0266-4000-8000-000000000266', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'camila Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0267-4000-8000-000000000267', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jennifer Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0268-4000-8000-000000000268', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Caroline Mariano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0269-4000-8000-000000000269', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marcela Goulart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0270-4000-8000-000000000270', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabel Conte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:31:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0271-4000-8000-000000000271', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Frank Affonseca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0272-4000-8000-000000000272', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinicius Correa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0273-4000-8000-000000000273', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Velloso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0274-4000-8000-000000000274', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anddriqui Bianchini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0275-4000-8000-000000000275', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Benaion', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0276-4000-8000-000000000276', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yuri Asato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:32:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0277-4000-8000-000000000277', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carla Rocco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:34:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0278-4000-8000-000000000278', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Aline Rocco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:34:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0279-4000-8000-000000000279', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maiara Queiroz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:34:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0280-4000-8000-000000000280', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karen Corrêa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:34:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0281-4000-8000-000000000281', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Luiza Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0282-4000-8000-000000000282', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Letícia Ramos Farjado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0283-4000-8000-000000000283', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Yasmin Mota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0284-4000-8000-000000000284', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Beatriz Fricks', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0285-4000-8000-000000000285', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Camila Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0286-4000-8000-000000000286', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jane brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0287-4000-8000-000000000287', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Julie brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0288-4000-8000-000000000288', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rodrigo amorim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0289-4000-8000-000000000289', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rodrigo menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T15:50:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0290-4000-8000-000000000290', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Laterza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:58:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0291-4000-8000-000000000291', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bernardo iorio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T15:58:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0292-4000-8000-000000000292', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Monique Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T16:02:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0293-4000-8000-000000000293', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Veronica Leal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0294-4000-8000-000000000294', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Simões', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0295-4000-8000-000000000295', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Guilherme Martins Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0296-4000-8000-000000000296', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando Carlos fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0297-4000-8000-000000000297', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando do Vale', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0298-4000-8000-000000000298', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rosemberg pavão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0299-4000-8000-000000000299', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Salvador', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0300-4000-8000-000000000300', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gleisson Vinícius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0301-4000-8000-000000000301', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo França', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0302-4000-8000-000000000302', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Veiga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0303-4000-8000-000000000303', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Tuche', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0304-4000-8000-000000000304', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Olavo Domingues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0305-4000-8000-000000000305', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'THIERRY GREGORIO', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0306-4000-8000-000000000306', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'ALEXANDRE MOCALI', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0307-4000-8000-000000000307', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'IVAN CARVALHO', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0308-4000-8000-000000000308', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isabelle Cristine da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0309-4000-8000-000000000309', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flavia Ferreira da Silva Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0310-4000-8000-000000000310', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa Lima Kelly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0311-4000-8000-000000000311', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flavia Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0312-4000-8000-000000000312', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0313-4000-8000-000000000313', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isabelle Cristine', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0314-4000-8000-000000000314', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tatiana Frazão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0315-4000-8000-000000000315', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thamires Esteves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0316-4000-8000-000000000316', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patricia Chagas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0317-4000-8000-000000000317', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Xavier', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0318-4000-8000-000000000318', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Pires', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0319-4000-8000-000000000319', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia Chagas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0320-4000-8000-000000000320', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Xavier', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0321-4000-8000-000000000321', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Byanka Arruzzo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0322-4000-8000-000000000322', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natália Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0323-4000-8000-000000000323', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolyne Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0324-4000-8000-000000000324', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Beatriz Daucheux', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0325-4000-8000-000000000325', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Robson Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0326-4000-8000-000000000326', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca Cerqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0327-4000-8000-000000000327', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juan Rodriguez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0328-4000-8000-000000000328', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marian Faxas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0329-4000-8000-000000000329', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jessica Faxas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0330-4000-8000-000000000330', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alejandra Mesa Cuadra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0331-4000-8000-000000000331', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Villela', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0332-4000-8000-000000000332', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alba Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0333-4000-8000-000000000333', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabiana Sauerbronn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0334-4000-8000-000000000334', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Claudiana Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0335-4000-8000-000000000335', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alessandra Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0336-4000-8000-000000000336', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0337-4000-8000-000000000337', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Cândido', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0338-4000-8000-000000000338', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscilla Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0339-4000-8000-000000000339', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Alexandre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0340-4000-8000-000000000340', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Diogo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0341-4000-8000-000000000341', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Clarissa Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0342-4000-8000-000000000342', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Nelson Couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0343-4000-8000-000000000343', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renato Leon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0344-4000-8000-000000000344', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Breno Ruback', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0345-4000-8000-000000000345', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carla de Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0346-4000-8000-000000000346', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cristiane Thompson', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0347-4000-8000-000000000347', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0348-4000-8000-000000000348', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabiano Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0349-4000-8000-000000000349', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcos Sergio Figueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0350-4000-8000-000000000350', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0351-4000-8000-000000000351', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Claudio Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0352-4000-8000-000000000352', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcos Furtado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0353-4000-8000-000000000353', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sandro Coloma', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0354-4000-8000-000000000354', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Paulo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0355-4000-8000-000000000355', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Augusto Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0356-4000-8000-000000000356', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Milena Costa Curta Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0357-4000-8000-000000000357', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kerly Yano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0358-4000-8000-000000000358', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Távora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0359-4000-8000-000000000359', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Medina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0360-4000-8000-000000000360', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0361-4000-8000-000000000361', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabrielle Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0362-4000-8000-000000000362', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Roma', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0363-4000-8000-000000000363', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thaís Ramalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0364-4000-8000-000000000364', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Magalhães', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0365-4000-8000-000000000365', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Xavier', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0366-4000-8000-000000000366', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Nara Matias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0367-4000-8000-000000000367', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jumaira Diniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0368-4000-8000-000000000368', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dilson Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0369-4000-8000-000000000369', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio Larrubia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0370-4000-8000-000000000370', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0371-4000-8000-000000000371', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amanda Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0372-4000-8000-000000000372', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carla Sotelo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0373-4000-8000-000000000373', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Denise Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0374-4000-8000-000000000374', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia Buono', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0375-4000-8000-000000000375', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscilla Paciello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0376-4000-8000-000000000376', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Luísa Fabiano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0377-4000-8000-000000000377', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Letícia Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0378-4000-8000-000000000378', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dhébora Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0379-4000-8000-000000000379', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lilian Passaglia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0380-4000-8000-000000000380', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caroline Rigaud', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0381-4000-8000-000000000381', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yolanda Simões Orsi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0382-4000-8000-000000000382', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Akemi Komagome', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0383-4000-8000-000000000383', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lara Fabian de Souza Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0384-4000-8000-000000000384', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amanda Ribeiro de Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0385-4000-8000-000000000385', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lis Nicodemos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0386-4000-8000-000000000386', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karina Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0387-4000-8000-000000000387', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caroline Poli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0388-4000-8000-000000000388', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lais Miranda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0389-4000-8000-000000000389', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kaian Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0390-4000-8000-000000000390', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Laís Miranda da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0391-4000-8000-000000000391', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kaian Santos da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0392-4000-8000-000000000392', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz de Mattos Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0393-4000-8000-000000000393', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabiana Barcelos de Mattos de Figueiredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0394-4000-8000-000000000394', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Carla Simões', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0395-4000-8000-000000000395', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camilly Vitória Vianna da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0396-4000-8000-000000000396', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jéssica Guedes Amorim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0397-4000-8000-000000000397', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Clarissa Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0398-4000-8000-000000000398', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0399-4000-8000-000000000399', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joana Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0400-4000-8000-000000000400', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tatiana Assub', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0401-4000-8000-000000000401', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Laís Miranda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0402-4000-8000-000000000402', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kaian Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0403-4000-8000-000000000403', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Miranda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0404-4000-8000-000000000404', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Almir gayano Gouvea junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0405-4000-8000-000000000405', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anthony Santin Zapata', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0406-4000-8000-000000000406', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rémi Humbert', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0407-4000-8000-000000000407', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0408-4000-8000-000000000408', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0409-4000-8000-000000000409', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0410-4000-8000-000000000410', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Olavo Domingues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0411-4000-8000-000000000411', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Luisa Fabiano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0412-4000-8000-000000000412', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Denise Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0413-4000-8000-000000000413', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dhébora Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0414-4000-8000-000000000414', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Letícia Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0415-4000-8000-000000000415', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia Buono', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0416-4000-8000-000000000416', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscilla Paciello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0417-4000-8000-000000000417', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Roberta Kidine', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0418-4000-8000-000000000418', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0419-4000-8000-000000000419', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marco Felipe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0420-4000-8000-000000000420', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Cardoni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0421-4000-8000-000000000421', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tiago Jesuste', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0422-4000-8000-000000000422', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Willer Siqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0423-4000-8000-000000000423', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alex Sipauba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0424-4000-8000-000000000424', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Milena Osório da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0425-4000-8000-000000000425', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'tomas osorio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0426-4000-8000-000000000426', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'joao paulo nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0427-4000-8000-000000000427', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'benjamin striar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0428-4000-8000-000000000428', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'leandro richelete', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0429-4000-8000-000000000429', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alexandre Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0430-4000-8000-000000000430', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luan Gouveia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0431-4000-8000-000000000431', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thierry Gregório', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0432-4000-8000-000000000432', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yasmin Magalhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0433-4000-8000-000000000433', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isabel avila', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0434-4000-8000-000000000434', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alice Accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0435-4000-8000-000000000435', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Cristina Castelo Branco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0436-4000-8000-000000000436', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Kyle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0437-4000-8000-000000000437', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daniela Vergara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0438-4000-8000-000000000438', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Adriano Gabriel Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0439-4000-8000-000000000439', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tatiana Carvalho de Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0440-4000-8000-000000000440', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Luiz Rocha de Noronha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0441-4000-8000-000000000441', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isabela cerri Bertolino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0442-4000-8000-000000000442', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alessandra cerri Bertolino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0443-4000-8000-000000000443', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luiz Henrique Fonseca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0444-4000-8000-000000000444', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mateus Matos Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0445-4000-8000-000000000445', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Taila Tanita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0446-4000-8000-000000000446', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Amaral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0447-4000-8000-000000000447', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ivy Couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0448-4000-8000-000000000448', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Paula Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0449-4000-8000-000000000449', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Monique Jose de Souza Chagas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0450-4000-8000-000000000450', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0451-4000-8000-000000000451', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0452-4000-8000-000000000452', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo França', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0453-4000-8000-000000000453', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Bandeira de Serpa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0454-4000-8000-000000000454', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas Jesus', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0455-4000-8000-000000000455', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Graziela Simões', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0456-4000-8000-000000000456', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cristiane Lessa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0457-4000-8000-000000000457', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bárbara Neiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0458-4000-8000-000000000458', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sandy Milesky', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0459-4000-8000-000000000459', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Dangelo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0460-4000-8000-000000000460', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca Dantas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0461-4000-8000-000000000461', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca Marchesano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0462-4000-8000-000000000462', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bernardo Martorelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0463-4000-8000-000000000463', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gilson Pires', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0464-4000-8000-000000000464', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Filipe Moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0465-4000-8000-000000000465', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jaqueline Serpa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0466-4000-8000-000000000466', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Malu Mesiano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0467-4000-8000-000000000467', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eliza Vardiero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0468-4000-8000-000000000468', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Myriam Heusi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0469-4000-8000-000000000469', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ludimila Mussi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0470-4000-8000-000000000470', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Paula Jacinto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0471-4000-8000-000000000471', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sigred Gleise', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0472-4000-8000-000000000472', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Miranda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0473-4000-8000-000000000473', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Milena Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0474-4000-8000-000000000474', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kerly Yano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0475-4000-8000-000000000475', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cinthia Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0476-4000-8000-000000000476', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ingryd Calheiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0477-4000-8000-000000000477', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Elin de souza scheeren', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0478-4000-8000-000000000478', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Izabela Bossardi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0479-4000-8000-000000000479', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Elin de Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0480-4000-8000-000000000480', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Juliana Campos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0481-4000-8000-000000000481', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Belissa Brunatto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0482-4000-8000-000000000482', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Juliana Campos da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0483-4000-8000-000000000483', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Borghi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0484-4000-8000-000000000484', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Oliveira Nogueira Pinto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0485-4000-8000-000000000485', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sabrina Barbosa da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0486-4000-8000-000000000486', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia Chagas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0487-4000-8000-000000000487', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Roberta de Castro Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0488-4000-8000-000000000488', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natalie Serrina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0489-4000-8000-000000000489', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Myriam Martins Heusi da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0490-4000-8000-000000000490', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eliza Vardiero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0491-4000-8000-000000000491', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rose Cristina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0492-4000-8000-000000000492', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renan Pacheco Quintino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0493-4000-8000-000000000493', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'DAYANA CHAVES DE OLIVEIRA', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0494-4000-8000-000000000494', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Livia Peres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0495-4000-8000-000000000495', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Moreno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0496-4000-8000-000000000496', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renata Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0497-4000-8000-000000000497', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Jazbik', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0498-4000-8000-000000000498', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa Machado da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0499-4000-8000-000000000499', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Enis junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0500-4000-8000-000000000500', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patricia Coura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0501-4000-8000-000000000501', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Abrahao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0502-4000-8000-000000000502', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Abrahão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0503-4000-8000-000000000503', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Abrahão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0504-4000-8000-000000000504', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Helen Farias da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0505-4000-8000-000000000505', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Luíisa Fabiano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0506-4000-8000-000000000506', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Denise Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0507-4000-8000-000000000507', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dhébora Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0508-4000-8000-000000000508', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Plínio Seixas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0509-4000-8000-000000000509', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Letícia Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0510-4000-8000-000000000510', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia Buono', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0511-4000-8000-000000000511', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscilla Paciello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0512-4000-8000-000000000512', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Roberta Kidine', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0513-4000-8000-000000000513', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0514-4000-8000-000000000514', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marco Felipe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0515-4000-8000-000000000515', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Elana Lannes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0516-4000-8000-000000000516', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana moreno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0517-4000-8000-000000000517', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Livia Peres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0518-4000-8000-000000000518', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria jazbik', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0519-4000-8000-000000000519', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila GIACOMET', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0520-4000-8000-000000000520', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Viviane Mondin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0521-4000-8000-000000000521', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Bahia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0522-4000-8000-000000000522', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Emanuela Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0523-4000-8000-000000000523', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Strauss', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0524-4000-8000-000000000524', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dayane Pires', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0525-4000-8000-000000000525', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Elaine Maceda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0526-4000-8000-000000000526', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Junior Maceda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0527-4000-8000-000000000527', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduarda Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0528-4000-8000-000000000528', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tamara da Cunha Faria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0529-4000-8000-000000000529', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila de Paula Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0530-4000-8000-000000000530', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Newton Coelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0531-4000-8000-000000000531', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0532-4000-8000-000000000532', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Michelle Medeiros Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0533-4000-8000-000000000533', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Bandeira de Serpa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0534-4000-8000-000000000534', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Erick Barradas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0535-4000-8000-000000000535', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Corrêa Azeredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0536-4000-8000-000000000536', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Coutinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0537-4000-8000-000000000537', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Tonani', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0538-4000-8000-000000000538', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karina Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0539-4000-8000-000000000539', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caroline Poli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0540-4000-8000-000000000540', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Clara Alonso casais', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0541-4000-8000-000000000541', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natália Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0542-4000-8000-000000000542', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Byanka Arruzzo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0543-4000-8000-000000000543', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca Cerqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0544-4000-8000-000000000544', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carollyne Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0545-4000-8000-000000000545', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriela Arruda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0546-4000-8000-000000000546', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'André Biasoli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0547-4000-8000-000000000547', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leandro Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0548-4000-8000-000000000548', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'João Yatudo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0549-4000-8000-000000000549', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafaela Santos Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0550-4000-8000-000000000550', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Santos Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0551-4000-8000-000000000551', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Franciane Santos Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0552-4000-8000-000000000552', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amanda Gregory', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0553-4000-8000-000000000553', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camille Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:14:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0554-4000-8000-000000000554', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas guinancio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:15:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0555-4000-8000-000000000555', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Ana paula carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:15:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0556-4000-8000-000000000556', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Cortes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:16:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0557-4000-8000-000000000557', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:19:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0558-4000-8000-000000000558', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Anna Carolina Basso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:19:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0559-4000-8000-000000000559', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karoline Coutinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:19:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0560-4000-8000-000000000560', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Vitoria Goncalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:19:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0561-4000-8000-000000000561', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Tamara Faria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:20:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0562-4000-8000-000000000562', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Priscila de Paula', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:20:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0563-4000-8000-000000000563', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabriela Avelino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:21:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0564-4000-8000-000000000564', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Paula Taborda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:21:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0565-4000-8000-000000000565', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jaqueline Malacarne', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:21:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0566-4000-8000-000000000566', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Cristiane Carius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:21:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0567-4000-8000-000000000567', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Neuci smith', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0568-4000-8000-000000000568', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Camila Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:25:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0569-4000-8000-000000000569', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Sónia Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:27:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0570-4000-8000-000000000570', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Helga Tavares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:27:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0571-4000-8000-000000000571', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Sonia Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T16:27:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0572-4000-8000-000000000572', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Helga Tavares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T16:27:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0573-4000-8000-000000000573', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Miguel Peredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T16:28:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0574-4000-8000-000000000574', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eurico Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T16:28:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0575-4000-8000-000000000575', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ilana Senos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:37:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0576-4000-8000-000000000576', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jaqueline Malacarne', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:37:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0577-4000-8000-000000000577', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lidiane Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:37:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0578-4000-8000-000000000578', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno Henrique Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T16:38:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0579-4000-8000-000000000579', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0580-4000-8000-000000000580', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anna Carolina Basso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0581-4000-8000-000000000581', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karoline Coutinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0582-4000-8000-000000000582', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vitória Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0583-4000-8000-000000000583', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Matheus Vettiner', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0584-4000-8000-000000000584', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alexandre Lucas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0585-4000-8000-000000000585', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Raposo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0586-4000-8000-000000000586', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio Zanazi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:39:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0587-4000-8000-000000000587', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Igor Sobral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:39:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0588-4000-8000-000000000588', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Pedro Novaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T16:46:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0589-4000-8000-000000000589', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rizza Chierici', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0590-4000-8000-000000000590', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana floriano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0591-4000-8000-000000000591', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lilian nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0592-4000-8000-000000000592', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Vitoria emidio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0593-4000-8000-000000000593', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Laise Albuquerque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0594-4000-8000-000000000594', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bruna Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T16:50:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0595-4000-8000-000000000595', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Eduarda Anes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:51:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0596-4000-8000-000000000596', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Rebeca romero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:51:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0597-4000-8000-000000000597', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mariana Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:51:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0598-4000-8000-000000000598', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jessika Rebello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:51:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0599-4000-8000-000000000599', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Carolina Pires', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T16:51:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0600-4000-8000-000000000600', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anthony Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:59:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0601-4000-8000-000000000601', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Nascimento Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T16:59:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0602-4000-8000-000000000602', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Paula Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:59:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0603-4000-8000-000000000603', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Layce Maria Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T16:59:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0604-4000-8000-000000000604', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Jazbik', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:00:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0605-4000-8000-000000000605', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Thaís Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:00:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0606-4000-8000-000000000606', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabiana Zambonini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T17:02:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0607-4000-8000-000000000607', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Zambonini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T17:02:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0608-4000-8000-000000000608', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Elaine Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T17:02:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0609-4000-8000-000000000609', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gia gao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:02:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0610-4000-8000-000000000610', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Eduardo Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:05:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0611-4000-8000-000000000611', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Ana carolina Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:08:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0612-4000-8000-000000000612', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Amanda Iglesias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:08:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0613-4000-8000-000000000613', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Priscilla Figueiredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:08:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0614-4000-8000-000000000614', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Alessandra Villardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:08:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0615-4000-8000-000000000615', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Danielle Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:08:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0616-4000-8000-000000000616', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bernardo Relvas Lucas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:08:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0617-4000-8000-000000000617', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Thales Leonardo da Veiga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T17:08:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0618-4000-8000-000000000618', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Bruna Amaral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:09:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0619-4000-8000-000000000619', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Ana Paula Galdino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:09:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0620-4000-8000-000000000620', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Vitor Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:09:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0621-4000-8000-000000000621', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Matheus montoni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:09:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0622-4000-8000-000000000622', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Fábio mothe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:09:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0623-4000-8000-000000000623', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Belphman', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:10:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0624-4000-8000-000000000624', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Sousa Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:10:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0625-4000-8000-000000000625', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rayani Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T17:15:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0626-4000-8000-000000000626', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Dara Rayane Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T17:15:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0627-4000-8000-000000000627', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Pedro Victor Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0628-4000-8000-000000000628', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Morenno reis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0629-4000-8000-000000000629', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Sarah trindade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0630-4000-8000-000000000630', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Kauan Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0631-4000-8000-000000000631', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Renan Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0632-4000-8000-000000000632', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lucca Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0633-4000-8000-000000000633', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Tabatha Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0634-4000-8000-000000000634', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Beatriz Drummond', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:16:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0635-4000-8000-000000000635', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Norton cockrane munaretto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:18:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0636-4000-8000-000000000636', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Julia barosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0637-4000-8000-000000000637', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Olavo domingues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0638-4000-8000-000000000638', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Raphael Araripe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0639-4000-8000-000000000639', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dilson Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0640-4000-8000-000000000640', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Saraiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0641-4000-8000-000000000641', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz Saraiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0642-4000-8000-000000000642', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0643-4000-8000-000000000643', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca isaac', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0644-4000-8000-000000000644', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Glacy de paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0645-4000-8000-000000000645', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Janaina maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0646-4000-8000-000000000646', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lilian carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0647-4000-8000-000000000647', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renata rass', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0648-4000-8000-000000000648', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0649-4000-8000-000000000649', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leandro Villas Bôas Cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0650-4000-8000-000000000650', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danillo Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0651-4000-8000-000000000651', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0652-4000-8000-000000000652', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Brunna Xavier', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0653-4000-8000-000000000653', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Lyra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0654-4000-8000-000000000654', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renata Reis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0655-4000-8000-000000000655', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diana Piffer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0656-4000-8000-000000000656', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Veronica Leal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0657-4000-8000-000000000657', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Simões', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0658-4000-8000-000000000658', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio Rezende', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0659-4000-8000-000000000659', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio Rezende', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0660-4000-8000-000000000660', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rosana Kelly Aguiar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0661-4000-8000-000000000661', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rubia Cavalcanti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0662-4000-8000-000000000662', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flavia Ramone', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0663-4000-8000-000000000663', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Barbato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0664-4000-8000-000000000664', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mia Hazanov', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0665-4000-8000-000000000665', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paula Uehara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0666-4000-8000-000000000666', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0667-4000-8000-000000000667', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariacelia Fernandes Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0668-4000-8000-000000000668', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodolpho Rodrigues da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0669-4000-8000-000000000669', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'David Sullyvan Sousa Maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0670-4000-8000-000000000670', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Shailla Pinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0671-4000-8000-000000000671', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Vallim Leão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0672-4000-8000-000000000672', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rubia Cavalcanti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0673-4000-8000-000000000673', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rosana Aguiar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0674-4000-8000-000000000674', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flávia Ramone', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0675-4000-8000-000000000675', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Barbato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0676-4000-8000-000000000676', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ronaldo moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0677-4000-8000-000000000677', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago wanzeler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0678-4000-8000-000000000678', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0679-4000-8000-000000000679', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alex Mendonça', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0680-4000-8000-000000000680', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patrícia costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0681-4000-8000-000000000681', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'heloisa costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0682-4000-8000-000000000682', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karmone Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0683-4000-8000-000000000683', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Saldanha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0684-4000-8000-000000000684', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Yamaki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0685-4000-8000-000000000685', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alessandra Rezende', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0686-4000-8000-000000000686', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Passarelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0687-4000-8000-000000000687', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amaury Siqueira júnior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0688-4000-8000-000000000688', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Manuel Gomez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0689-4000-8000-000000000689', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Emiliano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0690-4000-8000-000000000690', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Brenno Vinicius de Moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0691-4000-8000-000000000691', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Horta Sá Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0692-4000-8000-000000000692', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Henrique Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0693-4000-8000-000000000693', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Passarelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0694-4000-8000-000000000694', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Manuel Gomez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0695-4000-8000-000000000695', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amaury Siqueira Jr', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0696-4000-8000-000000000696', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Emiliano Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0697-4000-8000-000000000697', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelle Bistene', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0698-4000-8000-000000000698', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leticia Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0699-4000-8000-000000000699', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscilla Jones Figueiredo Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0700-4000-8000-000000000700', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0701-4000-8000-000000000701', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alessandra Villardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0702-4000-8000-000000000702', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T17:19:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0703-4000-8000-000000000703', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dante de Marco *', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Daniela', '2026-03-01T17:19:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0704-4000-8000-000000000704', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andre Rodrigues *', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0705-4000-8000-000000000705', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Fernandes *', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0706-4000-8000-000000000706', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'João Victor calado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0707-4000-8000-000000000707', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gabriel Ribeiro da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:19:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0708-4000-8000-000000000708', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gabriel Clemente', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T17:20:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0709-4000-8000-000000000709', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Sybele Oliveira de Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:23:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0710-4000-8000-000000000710', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Márcia Coimbra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:23:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0711-4000-8000-000000000711', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Natasha França Steffens', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:23:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0712-4000-8000-000000000712', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Savio Mendes Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:24:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0713-4000-8000-000000000713', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:24:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0714-4000-8000-000000000714', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Vasconcellos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:24:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0715-4000-8000-000000000715', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Priscilla Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:24:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0716-4000-8000-000000000716', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Amanda Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:24:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0717-4000-8000-000000000717', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'maria laura almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:25:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0718-4000-8000-000000000718', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Allana Lage', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:25:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0719-4000-8000-000000000719', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dante de Marco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:27:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0720-4000-8000-000000000720', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anderson Santana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:27:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0721-4000-8000-000000000721', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bianca Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:27:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0722-4000-8000-000000000722', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriela Arruda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:27:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0723-4000-8000-000000000723', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cristiana Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:27:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0724-4000-8000-000000000724', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Assis Pedrosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T17:39:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0725-4000-8000-000000000725', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Figueiredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:39:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0726-4000-8000-000000000726', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julyana Moretzsohn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0727-4000-8000-000000000727', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Gabriela', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0728-4000-8000-000000000728', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Júlia Fagundes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0729-4000-8000-000000000729', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amanda Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0730-4000-8000-000000000730', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bianca dos Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0731-4000-8000-000000000731', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Camila Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0732-4000-8000-000000000732', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Rafael Salles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0733-4000-8000-000000000733', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Giuseppe Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0734-4000-8000-000000000734', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Rafael Feitosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0735-4000-8000-000000000735', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Breno Tuxi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0736-4000-8000-000000000736', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Gabriel Goulart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0737-4000-8000-000000000737', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Jonathan Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:48:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0738-4000-8000-000000000738', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Matheus Sabariz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T17:49:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0739-4000-8000-000000000739', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Andrey Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T17:50:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0740-4000-8000-000000000740', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Giselle Sineiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T17:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0741-4000-8000-000000000741', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Isabelle Recchia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T17:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0742-4000-8000-000000000742', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Rafaela Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0743-4000-8000-000000000743', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Eliezer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0744-4000-8000-000000000744', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Anafe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0745-4000-8000-000000000745', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna Amaral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0746-4000-8000-000000000746', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Paula Galdino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0747-4000-8000-000000000747', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Allan Vinícius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0748-4000-8000-000000000748', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0749-4000-8000-000000000749', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Diniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0750-4000-8000-000000000750', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carlos Eduardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T17:59:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0751-4000-8000-000000000751', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Giuliana Piragibe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:11:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0752-4000-8000-000000000752', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Cristal Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:11:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0753-4000-8000-000000000753', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Alex Hutchins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0754-4000-8000-000000000754', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Chiba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0755-4000-8000-000000000755', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'David Zajac', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0756-4000-8000-000000000756', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Davi Iglesias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T18:14:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0757-4000-8000-000000000757', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Charles Antony', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:14:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0758-4000-8000-000000000758', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Eduarda Goncalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:14:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0759-4000-8000-000000000759', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Natany cristina ladeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T18:14:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0760-4000-8000-000000000760', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Cristiane Carius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:14:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0761-4000-8000-000000000761', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Beatriz silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0762-4000-8000-000000000762', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ines Rita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0763-4000-8000-000000000763', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Lagos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0764-4000-8000-000000000764', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carlota Rodriguez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0765-4000-8000-000000000765', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabielle Passine', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0766-4000-8000-000000000766', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Diana Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:26:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0767-4000-8000-000000000767', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mikaelly Martinez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T18:26:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0768-4000-8000-000000000768', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Felicit Alencar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:26:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0769-4000-8000-000000000769', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bianca bordin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:26:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0770-4000-8000-000000000770', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gustavo Petraglia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:40:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0771-4000-8000-000000000771', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'João Lucas Maia e Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0772-4000-8000-000000000772', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Felipe Robert Silva de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0773-4000-8000-000000000773', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz Zize', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0774-4000-8000-000000000774', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Saimom Gabriel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0775-4000-8000-000000000775', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinicius Magno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0776-4000-8000-000000000776', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Eduarda Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:43:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0777-4000-8000-000000000777', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Camila Melo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T18:53:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0778-4000-8000-000000000778', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thais Viegas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T18:53:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0779-4000-8000-000000000779', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Luiza Klokner', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T18:53:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0780-4000-8000-000000000780', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Vitor Portugal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:53:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0781-4000-8000-000000000781', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Joao Pedro Marinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:53:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0782-4000-8000-000000000782', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Roberta Mauro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:54:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0783-4000-8000-000000000783', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Suelen Mauro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:54:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0784-4000-8000-000000000784', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Morgana Mello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T18:54:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0785-4000-8000-000000000785', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Vittória Giácomo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:55:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0786-4000-8000-000000000786', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Bruna Faria Drumond', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:55:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0787-4000-8000-000000000787', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Jade Martins Avelino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:55:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0788-4000-8000-000000000788', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isadora Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:55:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0789-4000-8000-000000000789', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karina Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T18:55:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0790-4000-8000-000000000790', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Tauani Viana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:55:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0791-4000-8000-000000000791', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Eduarda Morais', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:56:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0792-4000-8000-000000000792', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jully Suarez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T18:56:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0793-4000-8000-000000000793', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinicio Alba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:56:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0794-4000-8000-000000000794', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Lara Leon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T18:58:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0795-4000-8000-000000000795', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Nicole Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T18:58:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0796-4000-8000-000000000796', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Bruna Hortas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:58:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0797-4000-8000-000000000797', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Verônica de Mello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T18:58:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0798-4000-8000-000000000798', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Thiago Muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:00:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0799-4000-8000-000000000799', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Rodolpho Bomfim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:00:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0800-4000-8000-000000000800', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Jose Geraldo Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:00:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0801-4000-8000-000000000801', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Andre Biasoli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T19:00:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0802-4000-8000-000000000802', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Leandro Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:00:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0803-4000-8000-000000000803', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'João Yatudo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:00:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0804-4000-8000-000000000804', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Dayene Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:08:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0805-4000-8000-000000000805', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Laryssa Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:08:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0806-4000-8000-000000000806', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Ana Carolina Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:08:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0807-4000-8000-000000000807', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Rayane Lamando', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:08:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0808-4000-8000-000000000808', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Agnes Pinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:08:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0809-4000-8000-000000000809', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:12:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0810-4000-8000-000000000810', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Cintia Cabral de Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:12:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0811-4000-8000-000000000811', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ana Clara ceh Signorelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:12:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0812-4000-8000-000000000812', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Isabella Paz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:12:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0813-4000-8000-000000000813', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Fabiano Simplicio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:22:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0814-4000-8000-000000000814', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Ademar Magalhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:22:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0815-4000-8000-000000000815', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Trovão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0816-4000-8000-000000000816', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariano Lucas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0817-4000-8000-000000000817', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Henrique Dorea', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0818-4000-8000-000000000818', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Barcellos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0819-4000-8000-000000000819', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0820-4000-8000-000000000820', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Suzane Machado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0821-4000-8000-000000000821', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ronaldo Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0822-4000-8000-000000000822', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Neder', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0823-4000-8000-000000000823', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gilson Pires', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0824-4000-8000-000000000824', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Coutinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0825-4000-8000-000000000825', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dennis Carrijo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0826-4000-8000-000000000826', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Fernando', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0827-4000-8000-000000000827', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luiz Roberto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0828-4000-8000-000000000828', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eddy silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0829-4000-8000-000000000829', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Nobre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0830-4000-8000-000000000830', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dhony Matos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0831-4000-8000-000000000831', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yuri Baião', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0832-4000-8000-000000000832', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'David Guerra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0833-4000-8000-000000000833', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paula macambira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0834-4000-8000-000000000834', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'ana Emília Ferraz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0835-4000-8000-000000000835', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Victoria Nova', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:22:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0836-4000-8000-000000000836', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Sarah Mamede', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0837-4000-8000-000000000837', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julye Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0838-4000-8000-000000000838', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julia Dourado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0839-4000-8000-000000000839', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0840-4000-8000-000000000840', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lilian Corade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0841-4000-8000-000000000841', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amanda Mota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0842-4000-8000-000000000842', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rebeca Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0843-4000-8000-000000000843', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luisa Mutzenbecher', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0844-4000-8000-000000000844', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raisa Borghi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0845-4000-8000-000000000845', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raphaela Lucena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0846-4000-8000-000000000846', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Impieri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0847-4000-8000-000000000847', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Mandriola', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:30:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0848-4000-8000-000000000848', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gibran Ghosn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:31:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0849-4000-8000-000000000849', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Antonio Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:31:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0850-4000-8000-000000000850', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Hertha Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:31:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0851-4000-8000-000000000851', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raphaela Lucena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0852-4000-8000-000000000852', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Julia Dourado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0853-4000-8000-000000000853', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Mariana Vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0854-4000-8000-000000000854', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Lilian Corade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0855-4000-8000-000000000855', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Amanda Mota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0856-4000-8000-000000000856', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Rebeca Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0857-4000-8000-000000000857', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Luisa Mutzenbecher', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0858-4000-8000-000000000858', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Raísa Borghi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0859-4000-8000-000000000859', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Fernanda Impieri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:33:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0860-4000-8000-000000000860', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Ruana Calabria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:36:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0861-4000-8000-000000000861', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Fernanda Klem', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T19:36:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0862-4000-8000-000000000862', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Débora Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:36:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0863-4000-8000-000000000863', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Marcelly Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:36:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0864-4000-8000-000000000864', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Andre Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0865-4000-8000-000000000865', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gabriel Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0866-4000-8000-000000000866', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Dante de Marco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:37:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0867-4000-8000-000000000867', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marina Medina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0868-4000-8000-000000000868', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paulo Henrique Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0869-4000-8000-000000000869', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pietro Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0870-4000-8000-000000000870', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz Vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0871-4000-8000-000000000871', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thales Ávila', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0872-4000-8000-000000000872', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Manuella Macedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0873-4000-8000-000000000873', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro belchior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0874-4000-8000-000000000874', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larissa Lara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0875-4000-8000-000000000875', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Júlia jeronymo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0876-4000-8000-000000000876', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Ferreira de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0877-4000-8000-000000000877', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Oliveira Ventura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0878-4000-8000-000000000878', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lara Raupp', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0879-4000-8000-000000000879', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carol Bauluni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0880-4000-8000-000000000880', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Borissota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0881-4000-8000-000000000881', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Pollyana Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0882-4000-8000-000000000882', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Helen Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0883-4000-8000-000000000883', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raquel Malafaia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0884-4000-8000-000000000884', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Jerônimo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0885-4000-8000-000000000885', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabi Giansante', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0886-4000-8000-000000000886', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Camila Damim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0887-4000-8000-000000000887', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Tayna Conrado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0888-4000-8000-000000000888', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Beatriz Legaspe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0889-4000-8000-000000000889', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Catarina Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0890-4000-8000-000000000890', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Milena Osório', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0891-4000-8000-000000000891', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Aline Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:38:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0892-4000-8000-000000000892', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:42:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0893-4000-8000-000000000893', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nicole Tiktin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:42:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0894-4000-8000-000000000894', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gustavo Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:43:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0895-4000-8000-000000000895', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela videira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:43:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0896-4000-8000-000000000896', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabella Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:43:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0897-4000-8000-000000000897', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Katherin Castillo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:43:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0898-4000-8000-000000000898', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Livia Paes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:43:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0899-4000-8000-000000000899', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carol Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:45:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0900-4000-8000-000000000900', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marcela Cohn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:45:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0901-4000-8000-000000000901', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:45:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0902-4000-8000-000000000902', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Pedro Menezes Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:46:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0903-4000-8000-000000000903', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paula macambira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:48:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0904-4000-8000-000000000904', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'ana Emília Ferraz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:48:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0905-4000-8000-000000000905', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Lucaroni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0906-4000-8000-000000000906', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amilcar das Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0907-4000-8000-000000000907', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafael Brunacci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Daniela', '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0908-4000-8000-000000000908', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caio Ruiz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0909-4000-8000-000000000909', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriel Muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0910-4000-8000-000000000910', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernando Garita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0911-4000-8000-000000000911', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Victor Zein', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0912-4000-8000-000000000912', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Willian White', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0913-4000-8000-000000000913', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Javier Arango', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0914-4000-8000-000000000914', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriel Katz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0915-4000-8000-000000000915', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Victor Paim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0916-4000-8000-000000000916', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriellle Bonoto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0917-4000-8000-000000000917', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Manuella Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0918-4000-8000-000000000918', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Pedro Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:50:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0919-4000-8000-000000000919', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Maryana Luvise', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:50:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0920-4000-8000-000000000920', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Ester Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0921-4000-8000-000000000921', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Ana Vetorazzo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:50:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0922-4000-8000-000000000922', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Ana Lucaroni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0923-4000-8000-000000000923', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Amilcar das Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0924-4000-8000-000000000924', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Rafael Brunacci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0925-4000-8000-000000000925', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Caio Ruiz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0926-4000-8000-000000000926', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabriel Muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0927-4000-8000-000000000927', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Fernando Garita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0928-4000-8000-000000000928', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Victor Zein', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0929-4000-8000-000000000929', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Willian White', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0930-4000-8000-000000000930', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Javier Arango', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0931-4000-8000-000000000931', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabriel Katz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0932-4000-8000-000000000932', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Victor Paim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0933-4000-8000-000000000933', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Gabriellle Bonoto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0934-4000-8000-000000000934', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Manuella Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:50:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0935-4000-8000-000000000935', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '1. anna luiza sardinha cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0936-4000-8000-000000000936', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '2. Luiz claudio cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0937-4000-8000-000000000937', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '3. Helena beatriz cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0938-4000-8000-000000000938', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '4. Leonardo rembischewski', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0939-4000-8000-000000000939', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '5. Maria Isabel rembischewski', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0940-4000-8000-000000000940', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '6. Sergio Luiz Duque estrada filho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0941-4000-8000-000000000941', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '7. Bianca Lacerda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0942-4000-8000-000000000942', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '8. Claudio Couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0943-4000-8000-000000000943', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '9. Matheus Esquef', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0944-4000-8000-000000000944', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '10. Bruna furtado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0945-4000-8000-000000000945', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '11. Carolina Gouvea', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0946-4000-8000-000000000946', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '12. Carla Serta Portugal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0947-4000-8000-000000000947', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '13.Maria Luiza Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0948-4000-8000-000000000948', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '14. Paula Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0949-4000-8000-000000000949', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '15. Luciana Cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0950-4000-8000-000000000950', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '16.Julia Borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0951-4000-8000-000000000951', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '17. Joao Guimaraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0952-4000-8000-000000000952', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '18.   paula Sayuri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0953-4000-8000-000000000953', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '19.   Carolina Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0954-4000-8000-000000000954', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '20.Claudia Poubel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0955-4000-8000-000000000955', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '21. Camila Santoro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0956-4000-8000-000000000956', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '22. Amanda Sarcineli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0957-4000-8000-000000000957', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '23. Frederico Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0958-4000-8000-000000000958', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '24. Rafaela Albano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0959-4000-8000-000000000959', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '25. Marina Campos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0960-4000-8000-000000000960', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '26. Marcela rochedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0961-4000-8000-000000000961', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '27. Joao Muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0962-4000-8000-000000000962', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '28. Eduarda Rochedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0963-4000-8000-000000000963', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '29. Joao Cabral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0964-4000-8000-000000000964', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '30.Luiza Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0965-4000-8000-000000000965', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '31. Marcelo Custodio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0966-4000-8000-000000000966', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '32. Brendo Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0967-4000-8000-000000000967', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '33.Leonardo Pimentel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0968-4000-8000-000000000968', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '34. mariana pingitore', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0969-4000-8000-000000000969', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '35. Geanny Banolas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0970-4000-8000-000000000970', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '36. Maria Luiza Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0971-4000-8000-000000000971', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '37. Luisa Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0972-4000-8000-000000000972', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '38. Gabriel Maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0973-4000-8000-000000000973', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '39. Alice Miller', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0974-4000-8000-000000000974', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '40. Luiz Eduardo camara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0975-4000-8000-000000000975', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '41. Ana Luísa Tobelem', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0976-4000-8000-000000000976', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '42. João Lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0977-4000-8000-000000000977', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '43. Lorrayne Habib', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0978-4000-8000-000000000978', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '44. Hugo Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0979-4000-8000-000000000979', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '45. Marina Porto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0980-4000-8000-000000000980', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0004-4000-8000-000000000001', '46. Guilherme Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:52:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0981-4000-8000-000000000981', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Fernanda Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:54:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0982-4000-8000-000000000982', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mayara de Paula', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T19:54:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0983-4000-8000-000000000983', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Eduardo Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:54:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0984-4000-8000-000000000984', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Leonardo baracho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:55:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0985-4000-8000-000000000985', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Fabiano simplicio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:55:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0986-4000-8000-000000000986', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ademar Magalhães', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:56:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0987-4000-8000-000000000987', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Michel carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:56:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0988-4000-8000-000000000988', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Camilo Andres cuellar torres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:56:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0989-4000-8000-000000000989', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rafael paredes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T19:56:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0990-4000-8000-000000000990', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ludmila Cantieri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:57:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0991-4000-8000-000000000991', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Priscila Kamoi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:57:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0992-4000-8000-000000000992', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Lara Raupp', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0993-4000-8000-000000000993', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Carol Bauluni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0994-4000-8000-000000000994', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Jessica Borissota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0995-4000-8000-000000000995', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Pollyana Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0996-4000-8000-000000000996', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Helen Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0997-4000-8000-000000000997', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raquel Malafaia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0998-4000-8000-000000000998', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Juliana Jeronimo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-0999-4000-8000-000000000999', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Fabi Giansante', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1000-4000-8000-000000001000', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Camila Damim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1001-4000-8000-000000001001', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Tayna Conrado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1002-4000-8000-000000001002', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Beatriz Legaspe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1003-4000-8000-000000001003', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Catarina Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1004-4000-8000-000000001004', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Milena Osório', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1005-4000-8000-000000001005', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Aline Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T19:58:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1006-4000-8000-000000001006', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Carlos Fontes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T19:59:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1007-4000-8000-000000001007', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Milagres.', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:03:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1008-4000-8000-000000001008', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maurício Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:04:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1009-4000-8000-000000001009', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Maurício Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:04:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1010-4000-8000-000000001010', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Leticia Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:04:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1011-4000-8000-000000001011', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Priscilla Jones Figueiredo Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:06:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1012-4000-8000-000000001012', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Alessandra Villardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:06:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1013-4000-8000-000000001013', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Danielle Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:06:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1014-4000-8000-000000001014', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabelle panza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:09:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1015-4000-8000-000000001015', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Alberto Pinheiro Romeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T20:09:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1016-4000-8000-000000001016', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'João Carlos Simões Júnior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:09:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1017-4000-8000-000000001017', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel Jose zogbi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T20:09:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1018-4000-8000-000000001018', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Anderson Laurentino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T20:09:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1019-4000-8000-000000001019', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Beatriz Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T20:11:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1020-4000-8000-000000001020', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Ines Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T20:11:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1021-4000-8000-000000001021', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Monique Badin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:12:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1022-4000-8000-000000001022', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Emanuella Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:12:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1023-4000-8000-000000001023', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Aline Marjorye', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:13:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1024-4000-8000-000000001024', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Hellen Regis Queiroz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:13:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1025-4000-8000-000000001025', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Bianca M dos Reis Lourenco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:13:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1026-4000-8000-000000001026', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Juliana cordon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:13:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1027-4000-8000-000000001027', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Spetseri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T20:15:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1028-4000-8000-000000001028', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Santoro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T20:22:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1029-4000-8000-000000001029', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Everthon Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:22:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1030-4000-8000-000000001030', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flavio Lomeu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:23:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1031-4000-8000-000000001031', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Corte Real', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:23:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1032-4000-8000-000000001032', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ery Noeli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:23:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1033-4000-8000-000000001033', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Evile Ramos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:29:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1034-4000-8000-000000001034', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lesnielen Tozo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:29:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1035-4000-8000-000000001035', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Alessandra Iara Ienkot', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:29:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1036-4000-8000-000000001036', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Gabriela videira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1037-4000-8000-000000001037', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Katherin Castillo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1038-4000-8000-000000001038', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Isabella Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1039-4000-8000-000000001039', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Livia Paes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:30:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1040-4000-8000-000000001040', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Olavo Domingues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1041-4000-8000-000000001041', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Garcez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1042-4000-8000-000000001042', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andre de Souza José', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1043-4000-8000-000000001043', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Almir gayano Gouvea junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1044-4000-8000-000000001044', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dardielle Lima Cesar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1045-4000-8000-000000001045', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Emerson Andrade Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1046-4000-8000-000000001046', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carola Victoria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1047-4000-8000-000000001047', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1048-4000-8000-000000001048', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Eugenia chialvo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1049-4000-8000-000000001049', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Antenor Tenorio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1050-4000-8000-000000001050', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Leal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1051-4000-8000-000000001051', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1052-4000-8000-000000001052', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mayara de Paula', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1053-4000-8000-000000001053', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Byanka Arruzzo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1054-4000-8000-000000001054', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natália Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1055-4000-8000-000000001055', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolyne Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1056-4000-8000-000000001056', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcel Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1057-4000-8000-000000001057', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Wagner Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1058-4000-8000-000000001058', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Viviane soares de Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1059-4000-8000-000000001059', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Adriana Marçal Vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1060-4000-8000-000000001060', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Layla Cristina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1061-4000-8000-000000001061', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Samara Siqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1062-4000-8000-000000001062', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna Machado Silveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1063-4000-8000-000000001063', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daniela moelecke de medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1064-4000-8000-000000001064', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Franco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1065-4000-8000-000000001065', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna Signorelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1066-4000-8000-000000001066', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dardielle Lima Cesar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1067-4000-8000-000000001067', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Emerson Andrade Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1068-4000-8000-000000001068', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vivian cordeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1069-4000-8000-000000001069', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline reinozo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1070-4000-8000-000000001070', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Márcio Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1071-4000-8000-000000001071', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karina Gonzalez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1072-4000-8000-000000001072', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Henrique carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1073-4000-8000-000000001073', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luiz eduardo gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1074-4000-8000-000000001074', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Waldir Aguiar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1075-4000-8000-000000001075', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'João Vitor Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1076-4000-8000-000000001076', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Cremonez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1077-4000-8000-000000001077', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jhorran Sant', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1078-4000-8000-000000001078', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'João Victor Bechara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1079-4000-8000-000000001079', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1080-4000-8000-000000001080', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Patricia Simas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1081-4000-8000-000000001081', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'LUZIANE SA', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1082-4000-8000-000000001082', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1083-4000-8000-000000001083', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Luiza Laboissiere Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1084-4000-8000-000000001084', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jailson Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1085-4000-8000-000000001085', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Erick Hipólito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1086-4000-8000-000000001086', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1087-4000-8000-000000001087', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carlos Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1088-4000-8000-000000001088', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alisson Leonardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1089-4000-8000-000000001089', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Babylon Zaya', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1090-4000-8000-000000001090', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Oscar Guevara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1091-4000-8000-000000001091', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tobi Edward', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1092-4000-8000-000000001092', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alexandru Zidaru', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1093-4000-8000-000000001093', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tainah Moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1094-4000-8000-000000001094', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lais Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:32:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1095-4000-8000-000000001095', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Caio Franca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:34:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1096-4000-8000-000000001096', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Éverton Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:34:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1097-4000-8000-000000001097', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Diego batalha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:34:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1098-4000-8000-000000001098', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'André Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1099-4000-8000-000000001099', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Claudia marreiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1100-4000-8000-000000001100', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andressa castilho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1101-4000-8000-000000001101', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Ávila', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1102-4000-8000-000000001102', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Carolina Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1103-4000-8000-000000001103', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Lucas do Nascimento', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1104-4000-8000-000000001104', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Carolina Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1105-4000-8000-000000001105', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'André Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1106-4000-8000-000000001106', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Claudia marreiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1107-4000-8000-000000001107', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andressa Castilho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1108-4000-8000-000000001108', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natalia Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1109-4000-8000-000000001109', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Raquel Lassance da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1110-4000-8000-000000001110', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Raquel Lassance da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1111-4000-8000-000000001111', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natalia Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1112-4000-8000-000000001112', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vivian Miguel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1113-4000-8000-000000001113', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aurora Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1114-4000-8000-000000001114', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Monique Lorosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1115-4000-8000-000000001115', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Fernanda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1116-4000-8000-000000001116', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mauricio Coelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1117-4000-8000-000000001117', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'César Saade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1118-4000-8000-000000001118', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriella Rodrigues Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1119-4000-8000-000000001119', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Fernanda Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:38:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1120-4000-8000-000000001120', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Eduardo Cataldo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:39:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1121-4000-8000-000000001121', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Fernanda sousa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:40:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1122-4000-8000-000000001122', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Victoria Melo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:40:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1123-4000-8000-000000001123', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Leonardo Mattos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T20:42:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1124-4000-8000-000000001124', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bernardo Salles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:42:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1125-4000-8000-000000001125', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Victor Vergamini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:42:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1126-4000-8000-000000001126', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Enrik Goraieb', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T20:42:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1127-4000-8000-000000001127', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Leticia Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1128-4000-8000-000000001128', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Merilin Silveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1129-4000-8000-000000001129', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andressa Manuela Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1130-4000-8000-000000001130', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Venâncio Igayara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1131-4000-8000-000000001131', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Cuello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1132-4000-8000-000000001132', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jessica Paes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1133-4000-8000-000000001133', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flavia Cuinas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1134-4000-8000-000000001134', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Collyer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1135-4000-8000-000000001135', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renata Orgler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:42:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1136-4000-8000-000000001136', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Pierre bernard', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:44:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1137-4000-8000-000000001137', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Joao Felipe Gois', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1138-4000-8000-000000001138', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Thiago Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1139-4000-8000-000000001139', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'João Gabriel Petros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:44:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1140-4000-8000-000000001140', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Fabio Henrique de freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:46:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1141-4000-8000-000000001141', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Joao neto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:46:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1142-4000-8000-000000001142', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Leticia Schimit', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:46:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1143-4000-8000-000000001143', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lidiane de Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:48:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1144-4000-8000-000000001144', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Karina Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:48:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1145-4000-8000-000000001145', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thais Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:48:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1146-4000-8000-000000001146', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ingrid Luna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:48:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1147-4000-8000-000000001147', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larissa Fontyne', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:48:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1148-4000-8000-000000001148', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'raquel argento', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T20:52:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1149-4000-8000-000000001149', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'milena evelyn santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T20:52:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1150-4000-8000-000000001150', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Neder', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:52:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1151-4000-8000-000000001151', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Albano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:52:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1152-4000-8000-000000001152', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Cristiane Carius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:52:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1153-4000-8000-000000001153', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriela pinto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:53:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1154-4000-8000-000000001154', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alessandro palomba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T20:53:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1155-4000-8000-000000001155', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bárbara Gazal habib', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:53:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1156-4000-8000-000000001156', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jessica Távora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:53:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1157-4000-8000-000000001157', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcela Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T20:53:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1158-4000-8000-000000001158', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Alves Pimentel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1159-4000-8000-000000001159', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gustavo de Paula Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1160-4000-8000-000000001160', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Pereira Diogo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1161-4000-8000-000000001161', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ronaldo Firmino de Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1162-4000-8000-000000001162', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leonardo Alexandre Simão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1163-4000-8000-000000001163', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larissa Cristina Simão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1164-4000-8000-000000001164', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luciana Pereira Diogo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1165-4000-8000-000000001165', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tomás Esterci Ramalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1166-4000-8000-000000001166', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Adriana Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1167-4000-8000-000000001167', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andressa Alves da Silveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1168-4000-8000-000000001168', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Deborah Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1169-4000-8000-000000001169', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alyne Gabrielle Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1170-4000-8000-000000001170', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gustavo Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1171-4000-8000-000000001171', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Henrique Maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1172-4000-8000-000000001172', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vivian Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:05:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1173-4000-8000-000000001173', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo assis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:06:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1174-4000-8000-000000001174', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'diego assis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:06:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1175-4000-8000-000000001175', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Anderson Stabile', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:07:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1176-4000-8000-000000001176', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ana Carolina Santucci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:10:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1177-4000-8000-000000001177', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Allan Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:11:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1178-4000-8000-000000001178', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Michelle Rinaldi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:11:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1179-4000-8000-000000001179', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Janaina Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:12:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1180-4000-8000-000000001180', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Elisa Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:12:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1181-4000-8000-000000001181', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabiola Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:12:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1182-4000-8000-000000001182', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marcella Lavalle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1183-4000-8000-000000001183', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nicoli Bacellar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1184-4000-8000-000000001184', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Catarina Favarin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1185-4000-8000-000000001185', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Carloni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1186-4000-8000-000000001186', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rebecca Maestrali', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1187-4000-8000-000000001187', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ilana Onofre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:12:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1188-4000-8000-000000001188', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bruna silveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:13:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1189-4000-8000-000000001189', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Kezia wayn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:13:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1190-4000-8000-000000001190', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Aline siqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:13:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1191-4000-8000-000000001191', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bruno honorato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:13:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1192-4000-8000-000000001192', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Adriano benevides', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:13:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1193-4000-8000-000000001193', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Giovanna Santoloni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:14:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1194-4000-8000-000000001194', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Suelen Bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:14:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1195-4000-8000-000000001195', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Barqueta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:14:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1196-4000-8000-000000001196', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:15:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1197-4000-8000-000000001197', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marco leão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:15:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1198-4000-8000-000000001198', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rui Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:15:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1199-4000-8000-000000001199', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andre cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:15:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1200-4000-8000-000000001200', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ricardo vermelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:15:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1201-4000-8000-000000001201', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'João Diniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:18:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1202-4000-8000-000000001202', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Gisele gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:19:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1203-4000-8000-000000001203', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Allany Vitória Veríssimo Natus', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:19:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1204-4000-8000-000000001204', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Patrick Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:20:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1205-4000-8000-000000001205', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Natália Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:20:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1206-4000-8000-000000001206', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Byanka Arruzzo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:20:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1207-4000-8000-000000001207', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bianca Cerqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:20:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1208-4000-8000-000000001208', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela arruda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:20:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1209-4000-8000-000000001209', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luisa Gabriela Figueiredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:21:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1210-4000-8000-000000001210', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jhonny Marllon Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:21:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1211-4000-8000-000000001211', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel Pinheiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:22:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1212-4000-8000-000000001212', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Pedro Poyart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:22:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1213-4000-8000-000000001213', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Fagundes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:23:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1214-4000-8000-000000001214', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Larissa Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:23:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1215-4000-8000-000000001215', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Melissa Siqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1216-4000-8000-000000001216', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Yngrid Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1217-4000-8000-000000001217', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela Delvaux', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1218-4000-8000-000000001218', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raissa Octavio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1219-4000-8000-000000001219', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Geisa Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1220-4000-8000-000000001220', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Victoria Colle Bersch', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:23:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1221-4000-8000-000000001221', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Fabiano Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:24:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1222-4000-8000-000000001222', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alessandra Pedrosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1223-4000-8000-000000001223', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Priscila Endson', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1224-4000-8000-000000001224', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Lohana rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1225-4000-8000-000000001225', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karina faraj', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1226-4000-8000-000000001226', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Melina gouvea', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1227-4000-8000-000000001227', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Suelen coquito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:24:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1228-4000-8000-000000001228', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Renan horisawa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:24:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1229-4000-8000-000000001229', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Pedro Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:24:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1230-4000-8000-000000001230', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Paula Taborda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:25:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1231-4000-8000-000000001231', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabiane Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:25:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1232-4000-8000-000000001232', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Christiano Lugao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1233-4000-8000-000000001233', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caíque andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1234-4000-8000-000000001234', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Francesconi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1235-4000-8000-000000001235', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Assis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1236-4000-8000-000000001236', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Clarissa Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1237-4000-8000-000000001237', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1238-4000-8000-000000001238', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thais Zeque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1239-4000-8000-000000001239', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Madureira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1240-4000-8000-000000001240', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joana Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1241-4000-8000-000000001241', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tatiana Assub', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1242-4000-8000-000000001242', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'DIENNE LARA', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1243-4000-8000-000000001243', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'THAMIRES SANTOS', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1244-4000-8000-000000001244', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mauricio Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1245-4000-8000-000000001245', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana milagres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1246-4000-8000-000000001246', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Anna Paula Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1247-4000-8000-000000001247', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Keluska Alessa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1248-4000-8000-000000001248', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Heidy Efraim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1249-4000-8000-000000001249', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gustavo Leoni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1250-4000-8000-000000001250', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Monique Lorosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1251-4000-8000-000000001251', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dennis Carrijo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1252-4000-8000-000000001252', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Fernando', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1253-4000-8000-000000001253', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Pedro Tenorio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1254-4000-8000-000000001254', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Omar Ghazi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1255-4000-8000-000000001255', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Bento', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1256-4000-8000-000000001256', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcelo Bertoche', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1257-4000-8000-000000001257', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gustavo Rechdan', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1258-4000-8000-000000001258', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:26:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1259-4000-8000-000000001259', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Vanessa Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:27:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1260-4000-8000-000000001260', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Viviane Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:27:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1261-4000-8000-000000001261', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Mariana Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:27:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1262-4000-8000-000000001262', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Carlos Junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:28:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1263-4000-8000-000000001263', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Jamil Saad', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:29:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1264-4000-8000-000000001264', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thais Daudt', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:29:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1265-4000-8000-000000001265', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Danielle Mauro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:29:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1266-4000-8000-000000001266', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nara Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:29:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1267-4000-8000-000000001267', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Deborah Rabelo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:29:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1268-4000-8000-000000001268', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Tibério Círio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:32:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1269-4000-8000-000000001269', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Ricardo del razo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:32:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1270-4000-8000-000000001270', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Cristina Baraldo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1271-4000-8000-000000001271', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Claudia Xavier', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1272-4000-8000-000000001272', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Simone rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1273-4000-8000-000000001273', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Danielle leao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1274-4000-8000-000000001274', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Kenya Loures', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1275-4000-8000-000000001275', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Patricia Monsora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1276-4000-8000-000000001276', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jaiza Furtado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1277-4000-8000-000000001277', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Virgínia Silveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1278-4000-8000-000000001278', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Danubia Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1279-4000-8000-000000001279', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alessandra Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1280-4000-8000-000000001280', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karla Rio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1281-4000-8000-000000001281', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Larissa Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1282-4000-8000-000000001282', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thais Arguelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1283-4000-8000-000000001283', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Roberta Nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1284-4000-8000-000000001284', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alexandra mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1285-4000-8000-000000001285', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marina Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1286-4000-8000-000000001286', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Anderson milanez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1287-4000-8000-000000001287', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Paulo gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:33:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1288-4000-8000-000000001288', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jessica Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:36:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1289-4000-8000-000000001289', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Thaís Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:36:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1290-4000-8000-000000001290', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Thamires Carneiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1291-4000-8000-000000001291', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Thamires Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1292-4000-8000-000000001292', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amelia Daly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1293-4000-8000-000000001293', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rashaunna Nelson', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1294-4000-8000-000000001294', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lorena Quitete', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1295-4000-8000-000000001295', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larice Mota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1296-4000-8000-000000001296', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Denise Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1297-4000-8000-000000001297', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Patrícia Buono', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1298-4000-8000-000000001298', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Dhébora Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:37:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1299-4000-8000-000000001299', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Christiano Cale', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:40:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1300-4000-8000-000000001300', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Telma Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:40:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1301-4000-8000-000000001301', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Nadia Barradas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:40:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1302-4000-8000-000000001302', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Carla Morais', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:40:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1303-4000-8000-000000001303', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Verdini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:42:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1304-4000-8000-000000001304', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Roberto Paes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:44:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1305-4000-8000-000000001305', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bruno valle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:45:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1306-4000-8000-000000001306', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Eduardo Ferraz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:45:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1307-4000-8000-000000001307', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Ever Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:45:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1308-4000-8000-000000001308', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Thaís da mata', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:45:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1309-4000-8000-000000001309', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Monique Ferla', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:46:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1310-4000-8000-000000001310', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Larice Mota', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:46:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1311-4000-8000-000000001311', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lorena Quitete', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:46:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1312-4000-8000-000000001312', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mayara Magle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:46:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1313-4000-8000-000000001313', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Giuliana Piragibe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1314-4000-8000-000000001314', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Felipe Chiba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1315-4000-8000-000000001315', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'David Zajac', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1316-4000-8000-000000001316', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cristal Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1317-4000-8000-000000001317', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Alex Hutchins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1318-4000-8000-000000001318', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Victoria Melo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1319-4000-8000-000000001319', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Anny Caroliny', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1320-4000-8000-000000001320', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caroliny Miranda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1321-4000-8000-000000001321', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Karlos Eduardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1322-4000-8000-000000001322', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leon Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:46:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1323-4000-8000-000000001323', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Emilly Neris da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:47:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1324-4000-8000-000000001324', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Viviane Machado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:47:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1325-4000-8000-000000001325', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maria Jazbik', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:50:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1326-4000-8000-000000001326', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mariana Moreno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:50:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1327-4000-8000-000000001327', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Livia Peres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:50:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1328-4000-8000-000000001328', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Dayana Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:50:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1329-4000-8000-000000001329', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Luana Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:50:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1330-4000-8000-000000001330', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Sabrina Freire', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:50:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1331-4000-8000-000000001331', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabriela sundqvist', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:50:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1332-4000-8000-000000001332', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ana clara Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:50:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1333-4000-8000-000000001333', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Thays couto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1334-4000-8000-000000001334', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Barbara Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1335-4000-8000-000000001335', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Denise Gibson', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1336-4000-8000-000000001336', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruno de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1337-4000-8000-000000001337', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ricardo Del Razo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1338-4000-8000-000000001338', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Akene Abrão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1339-4000-8000-000000001339', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodolpho Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1340-4000-8000-000000001340', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'José Ricardo Paim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1341-4000-8000-000000001341', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio França', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1342-4000-8000-000000001342', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Éverton Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1343-4000-8000-000000001343', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego batalha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1344-4000-8000-000000001344', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eron Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1345-4000-8000-000000001345', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago ruza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1346-4000-8000-000000001346', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daniel Souto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1347-4000-8000-000000001347', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Victor Borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1348-4000-8000-000000001348', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bernardo Simão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1349-4000-8000-000000001349', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jean de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1350-4000-8000-000000001350', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas Nadaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1351-4000-8000-000000001351', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Agata Naiara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1352-4000-8000-000000001352', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Breno Estanislau', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1353-4000-8000-000000001353', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thaís Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1354-4000-8000-000000001354', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gislaine linhares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1355-4000-8000-000000001355', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Erik rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1356-4000-8000-000000001356', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marlon Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1357-4000-8000-000000001357', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amanda Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1358-4000-8000-000000001358', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ramy Brito Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1359-4000-8000-000000001359', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Vargas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1360-4000-8000-000000001360', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Henrico Kirst', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1361-4000-8000-000000001361', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andre Marum', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1362-4000-8000-000000001362', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tomás Ramalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:51:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1363-4000-8000-000000001363', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Maísa Passos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1364-4000-8000-000000001364', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Elisa Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1365-4000-8000-000000001365', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Pedro Loiola', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1366-4000-8000-000000001366', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Durand', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:52:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1367-4000-8000-000000001367', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Marta Fonseca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1368-4000-8000-000000001368', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Luciana Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1369-4000-8000-000000001369', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Camille Nipper', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1370-4000-8000-000000001370', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Carla Maione', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1371-4000-8000-000000001371', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Raissa Ramos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1372-4000-8000-000000001372', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Estefani Dantas Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1373-4000-8000-000000001373', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Ana Flavia Valle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1374-4000-8000-000000001374', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Larissa de Sá', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1375-4000-8000-000000001375', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Julyana Novaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1376-4000-8000-000000001376', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Bianca tozini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1377-4000-8000-000000001377', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Priscila Custodio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1378-4000-8000-000000001378', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Alessandra Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1379-4000-8000-000000001379', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Karla Rio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1380-4000-8000-000000001380', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Glória Buarque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1381-4000-8000-000000001381', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Larissa Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1382-4000-8000-000000001382', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Sabrina Evangelista da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1383-4000-8000-000000001383', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Karla waleska cvitanic Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1384-4000-8000-000000001384', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Pamela Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1385-4000-8000-000000001385', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Cristiane delgado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1386-4000-8000-000000001386', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Mikaelle Milão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1387-4000-8000-000000001387', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Thatiana Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1388-4000-8000-000000001388', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Raiane de Oliveira s da silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1389-4000-8000-000000001389', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Patrick G Azor', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1390-4000-8000-000000001390', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Emanuele Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1391-4000-8000-000000001391', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Natany cristina ladeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1392-4000-8000-000000001392', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Cristiane Carius', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1393-4000-8000-000000001393', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Juliana de Mendonça', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1394-4000-8000-000000001394', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Larissa Justino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1395-4000-8000-000000001395', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Joice Kauane', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1396-4000-8000-000000001396', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Elaine Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1397-4000-8000-000000001397', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Monaliza Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1398-4000-8000-000000001398', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Ana Davila Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1399-4000-8000-000000001399', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Nicole Araújo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1400-4000-8000-000000001400', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Sebastiane Angelim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1401-4000-8000-000000001401', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Christiane Lacerda', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1402-4000-8000-000000001402', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Renata Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1403-4000-8000-000000001403', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Ana Clara Nantua', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1404-4000-8000-000000001404', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Adriana Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1405-4000-8000-000000001405', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Ana Luiza Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1406-4000-8000-000000001406', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Flávia Favoreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1407-4000-8000-000000001407', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Katelyn Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1408-4000-8000-000000001408', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Danielle Macedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1409-4000-8000-000000001409', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Luana Pimenta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1410-4000-8000-000000001410', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Natascha Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1411-4000-8000-000000001411', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Monique Ferla', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1412-4000-8000-000000001412', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Juliana Vieira de Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1413-4000-8000-000000001413', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Joanice Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1414-4000-8000-000000001414', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Paula Lavinas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1415-4000-8000-000000001415', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Simone Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1416-4000-8000-000000001416', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Layane Santa Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1417-4000-8000-000000001417', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Akene Abrão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1418-4000-8000-000000001418', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Danyelle Scher', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1419-4000-8000-000000001419', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Aline Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1420-4000-8000-000000001420', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Maiara Modenese', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1421-4000-8000-000000001421', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Carina Melo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1422-4000-8000-000000001422', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Renata Ferreira dos Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1423-4000-8000-000000001423', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Júlia Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1424-4000-8000-000000001424', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Fernanda Magalhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1425-4000-8000-000000001425', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Kariny Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1426-4000-8000-000000001426', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Nathalia Ramos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Thalyta Garcia', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1427-4000-8000-000000001427', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Alessandra Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1428-4000-8000-000000001428', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Caroline Espindola', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1429-4000-8000-000000001429', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Manuela Pinheiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1430-4000-8000-000000001430', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Paloma Carolina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1431-4000-8000-000000001431', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Paula Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1432-4000-8000-000000001432', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Catarina Sousa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1433-4000-8000-000000001433', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Rayanne Zanon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1434-4000-8000-000000001434', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Marcia Coimbra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1435-4000-8000-000000001435', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Natasha steffens', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1436-4000-8000-000000001436', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Sybele souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1437-4000-8000-000000001437', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Mariana Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1438-4000-8000-000000001438', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Patrícia Lemos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1439-4000-8000-000000001439', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Jackie Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1440-4000-8000-000000001440', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Andressa Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1441-4000-8000-000000001441', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Amanda Caceres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1442-4000-8000-000000001442', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Giselle Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1443-4000-8000-000000001443', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raisa Borghi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1444-4000-8000-000000001444', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carolina Muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1445-4000-8000-000000001445', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Shaila Pinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1446-4000-8000-000000001446', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Claudia Barcellos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1447-4000-8000-000000001447', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marlene Santana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1448-4000-8000-000000001448', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Nayara Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1449-4000-8000-000000001449', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Waleska Kotlowski', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:52:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1450-4000-8000-000000001450', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Everton Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1451-4000-8000-000000001451', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thaly Malka', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:53:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1452-4000-8000-000000001452', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ursula Goldoni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:53:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1453-4000-8000-000000001453', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mayara Magle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1454-4000-8000-000000001454', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1455-4000-8000-000000001455', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carolina Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1456-4000-8000-000000001456', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria de Fátima Cabral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1457-4000-8000-000000001457', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1458-4000-8000-000000001458', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1459-4000-8000-000000001459', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Papini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1460-4000-8000-000000001460', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'João Gustavo Dumont', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1461-4000-8000-000000001461', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Walter Bakaleiko', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1462-4000-8000-000000001462', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Julinho Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1463-4000-8000-000000001463', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Rafael Novaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1464-4000-8000-000000001464', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'João Spetseri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1465-4000-8000-000000001465', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Luis Wolf Trzcina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1466-4000-8000-000000001466', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Marcus Reis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:53:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1467-4000-8000-000000001467', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Rodrigo Amorim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1468-4000-8000-000000001468', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Ana paula carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1469-4000-8000-000000001469', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Rodrigo Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1470-4000-8000-000000001470', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Jane Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1471-4000-8000-000000001471', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Julie Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1472-4000-8000-000000001472', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Lucas Guinancio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1473-4000-8000-000000001473', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Beatriz Fricks', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1474-4000-8000-000000001474', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Camila Medeiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1475-4000-8000-000000001475', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Andre marino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1476-4000-8000-000000001476', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Felipe Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1477-4000-8000-000000001477', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Raphael Bittencourt', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1478-4000-8000-000000001478', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Rodrigo gimenses', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1479-4000-8000-000000001479', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Filipe pacheco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1480-4000-8000-000000001480', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Vinicius andre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1481-4000-8000-000000001481', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Igor chafim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1482-4000-8000-000000001482', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcela Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1483-4000-8000-000000001483', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leandro Espinho de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1484-4000-8000-000000001484', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Penna Passos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1485-4000-8000-000000001485', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabiana Tavares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1486-4000-8000-000000001486', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pollyana Amaral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1487-4000-8000-000000001487', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas Freire Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1488-4000-8000-000000001488', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sofia Rodrigues Silvestre Guedes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1489-4000-8000-000000001489', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Guilherme Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1490-4000-8000-000000001490', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1491-4000-8000-000000001491', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marielle Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1492-4000-8000-000000001492', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Glauco Rodrigues rodovalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1493-4000-8000-000000001493', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Caixeta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1494-4000-8000-000000001494', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Allan Madeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1495-4000-8000-000000001495', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Angélica Farias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1496-4000-8000-000000001496', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Flávio Saldanha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1497-4000-8000-000000001497', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Giselle Anet', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1498-4000-8000-000000001498', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Sales', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1499-4000-8000-000000001499', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danillo Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1500-4000-8000-000000001500', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Josy Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1501-4000-8000-000000001501', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lorrany Moitim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1502-4000-8000-000000001502', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fábio Gallas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1503-4000-8000-000000001503', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Cassundé', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1504-4000-8000-000000001504', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luis Fernando Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1505-4000-8000-000000001505', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Guanabara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1506-4000-8000-000000001506', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Débora Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1507-4000-8000-000000001507', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Barreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1508-4000-8000-000000001508', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Carbonara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1509-4000-8000-000000001509', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernando Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1510-4000-8000-000000001510', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Andressa Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1511-4000-8000-000000001511', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camille Najan', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1512-4000-8000-000000001512', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Nathalia Lemos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1513-4000-8000-000000001513', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leon Ramos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1514-4000-8000-000000001514', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Kelly Brito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1515-4000-8000-000000001515', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carla Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1516-4000-8000-000000001516', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1517-4000-8000-000000001517', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Otávio Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1518-4000-8000-000000001518', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tommaso Scarpari', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1519-4000-8000-000000001519', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vitor Hugo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1520-4000-8000-000000001520', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Willian Gunther', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1521-4000-8000-000000001521', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pablo Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1522-4000-8000-000000001522', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1523-4000-8000-000000001523', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1524-4000-8000-000000001524', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Santoro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1525-4000-8000-000000001525', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Tavares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1526-4000-8000-000000001526', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Moutella', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:54:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1527-4000-8000-000000001527', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Santana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:55:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1528-4000-8000-000000001528', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Renan Paschoal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:55:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1529-4000-8000-000000001529', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Paula dos Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:56:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1530-4000-8000-000000001530', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Jose Mauro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T21:56:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1531-4000-8000-000000001531', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Inez Chaves da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:58:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1532-4000-8000-000000001532', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mariana Chaves da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T21:58:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1533-4000-8000-000000001533', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Rayane Sobrinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T21:58:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1534-4000-8000-000000001534', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Luis Gustavo Paz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T21:59:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1535-4000-8000-000000001535', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Taiana cascardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T21:59:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1536-4000-8000-000000001536', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Pollastri', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:59:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1537-4000-8000-000000001537', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Renata Lucca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T21:59:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1538-4000-8000-000000001538', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Vinicius Freire', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:00:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1539-4000-8000-000000001539', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Diogo borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:00:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1540-4000-8000-000000001540', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Campos Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:00:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1541-4000-8000-000000001541', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Stephanie Mellye', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1542-4000-8000-000000001542', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Melissa Manhães', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1543-4000-8000-000000001543', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luísa Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1544-4000-8000-000000001544', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Evellyn Bachschmied', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1545-4000-8000-000000001545', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jennifer Marchiori', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1546-4000-8000-000000001546', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Sarah Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:02:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1547-4000-8000-000000001547', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yuri Lumer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:03:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1548-4000-8000-000000001548', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Davi Lucas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:03:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1549-4000-8000-000000001549', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Carlos Fontes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:03:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1550-4000-8000-000000001550', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raquel Cotta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:04:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1551-4000-8000-000000001551', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Katarina Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:04:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1552-4000-8000-000000001552', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Barbara Pancotto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:04:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1553-4000-8000-000000001553', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raquel Cotta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1554-4000-8000-000000001554', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Milena Guterres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1555-4000-8000-000000001555', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Katarina Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1556-4000-8000-000000001556', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Pancotto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1557-4000-8000-000000001557', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marcos Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1558-4000-8000-000000001558', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Iglesias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:04:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1559-4000-8000-000000001559', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1560-4000-8000-000000001560', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Jessica Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1561-4000-8000-000000001561', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Erica Pinheiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1562-4000-8000-000000001562', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Goulart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1563-4000-8000-000000001563', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Felipe de Araujo Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1564-4000-8000-000000001564', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daniel Ribeiro Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1565-4000-8000-000000001565', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Sheila Bitencourt Coelho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1566-4000-8000-000000001566', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daiana azzara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1567-4000-8000-000000001567', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luana Lopes de Queiroz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1568-4000-8000-000000001568', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'safira ellen matos sá', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1569-4000-8000-000000001569', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Vinicius lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1570-4000-8000-000000001570', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Joao pedro rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1571-4000-8000-000000001571', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raquel Cotta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1572-4000-8000-000000001572', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Milena Guterres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1573-4000-8000-000000001573', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Katarina Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1574-4000-8000-000000001574', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Pancotto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1575-4000-8000-000000001575', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Laiza Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1576-4000-8000-000000001576', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mariana Maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1577-4000-8000-000000001577', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Janine Diedrich', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1578-4000-8000-000000001578', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodolpho bonfim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1579-4000-8000-000000001579', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago muniz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1580-4000-8000-000000001580', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinicius lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1581-4000-8000-000000001581', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao pedro rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1582-4000-8000-000000001582', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Vinicius Lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1583-4000-8000-000000001583', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Pedro Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T22:05:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1584-4000-8000-000000001584', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Tibério Círio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:05:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1585-4000-8000-000000001585', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Leonardo Lucena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:08:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1586-4000-8000-000000001586', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Silvia cabero Quesada', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:09:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1587-4000-8000-000000001587', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Jennifer Zapata Navarro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:09:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1588-4000-8000-000000001588', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Heline Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:09:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1589-4000-8000-000000001589', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Julia Valentin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:10:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1590-4000-8000-000000001590', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Tavares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:12:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1591-4000-8000-000000001591', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thais Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:12:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1592-4000-8000-000000001592', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Patricia dos santos sao roque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:12:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1593-4000-8000-000000001593', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Valéria dos anjos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:14:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1594-4000-8000-000000001594', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Patrícia nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:14:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1595-4000-8000-000000001595', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Raíle souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:14:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1596-4000-8000-000000001596', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caroline Maggio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:15:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1597-4000-8000-000000001597', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Larissa Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:15:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1598-4000-8000-000000001598', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Queila Castro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:15:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1599-4000-8000-000000001599', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gabriel Queiroz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:15:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1600-4000-8000-000000001600', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Pierre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:15:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1601-4000-8000-000000001601', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel Villarins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:15:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1602-4000-8000-000000001602', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Fernanda Prando', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:15:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1603-4000-8000-000000001603', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Denise noll', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:15:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1604-4000-8000-000000001604', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Luis Felipe Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:16:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1605-4000-8000-000000001605', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Eduardo Jesus', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:16:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1606-4000-8000-000000001606', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Cinthia Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1607-4000-8000-000000001607', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Raphaela Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1608-4000-8000-000000001608', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Nathasha Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1609-4000-8000-000000001609', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Karla Andrea da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1610-4000-8000-000000001610', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Virna Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1611-4000-8000-000000001611', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Mary Pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1612-4000-8000-000000001612', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Richarlyson Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1613-4000-8000-000000001613', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Luiz Henrique Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1614-4000-8000-000000001614', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Nicholas Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1615-4000-8000-000000001615', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Hélio Nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1616-4000-8000-000000001616', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Patrick Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1617-4000-8000-000000001617', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Fabio Viana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1618-4000-8000-000000001618', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Pablo Maghelly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:17:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1619-4000-8000-000000001619', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Goulart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:17:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1620-4000-8000-000000001620', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Hyan Franca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:18:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1621-4000-8000-000000001621', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Pedro Beltrão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1622-4000-8000-000000001622', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Daniella Habib', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1623-4000-8000-000000001623', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Habib', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1624-4000-8000-000000001624', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1625-4000-8000-000000001625', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Prado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1626-4000-8000-000000001626', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Tatiana Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1627-4000-8000-000000001627', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1628-4000-8000-000000001628', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jade Porto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1629-4000-8000-000000001629', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Anna Carolina Posner', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1630-4000-8000-000000001630', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nicole Goldstein', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1631-4000-8000-000000001631', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Katharina Kern', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1632-4000-8000-000000001632', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Lucy Markos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:18:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1633-4000-8000-000000001633', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:19:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1634-4000-8000-000000001634', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Taisa Albano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:19:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1635-4000-8000-000000001635', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno Loureiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:20:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1636-4000-8000-000000001636', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabriela mol', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:21:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1637-4000-8000-000000001637', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paula maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:21:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1638-4000-8000-000000001638', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Andres Herrera', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:21:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1639-4000-8000-000000001639', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Marcus Vinícius Júnior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:21:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1640-4000-8000-000000001640', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:21:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1641-4000-8000-000000001641', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Rafael Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1642-4000-8000-000000001642', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Saulo Gontijo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1643-4000-8000-000000001643', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1644-4000-8000-000000001644', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Regis Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1645-4000-8000-000000001645', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Paulo Henrique Louzada', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1646-4000-8000-000000001646', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Damiao Sa da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1647-4000-8000-000000001647', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'André camelo da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1648-4000-8000-000000001648', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Vitor Tulio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T22:22:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1649-4000-8000-000000001649', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Matthew downy', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1650-4000-8000-000000001650', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Fabrício de Oliveira Assunção', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1651-4000-8000-000000001651', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Daniel Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:22:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1652-4000-8000-000000001652', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao Carlos Fontes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1653-4000-8000-000000001653', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Eduardo Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1654-4000-8000-000000001654', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Inez Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1655-4000-8000-000000001655', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Mariana Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1656-4000-8000-000000001656', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rayane Kelly Sobrinho da silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Thalyta Garcia', '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1657-4000-8000-000000001657', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luís gustavo de Almeida paz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:24:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1658-4000-8000-000000001658', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Lista do Thiago Gross', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:24:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1659-4000-8000-000000001659', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Caroline Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:24:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1660-4000-8000-000000001660', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Carolina Guanabara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:24:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1661-4000-8000-000000001661', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Michel carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:24:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1662-4000-8000-000000001662', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Briane Bohrer Andrigo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:25:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1663-4000-8000-000000001663', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Larissa Amália Weber', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:25:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1664-4000-8000-000000001664', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'André marun', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:25:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1665-4000-8000-000000001665', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael louzada', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:25:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1666-4000-8000-000000001666', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Lins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:25:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1667-4000-8000-000000001667', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Alexandre Fernandes Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:26:50-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1668-4000-8000-000000001668', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Marcos Rangel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:29:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1669-4000-8000-000000001669', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Frederico Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:29:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1670-4000-8000-000000001670', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:29:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1671-4000-8000-000000001671', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Nazarena gomez de jong', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:29:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1672-4000-8000-000000001672', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Mario Junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:29:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1673-4000-8000-000000001673', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Diego Barcellos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:29:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1674-4000-8000-000000001674', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Waldir Vieira Del Giudice Junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:29:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1675-4000-8000-000000001675', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Paula macambira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:30:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1676-4000-8000-000000001676', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabrício de Oliveira Assunção', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:30:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1677-4000-8000-000000001677', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Mariana Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:30:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1678-4000-8000-000000001678', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Matthew downy', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:30:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1679-4000-8000-000000001679', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Matthew downy', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:31:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1680-4000-8000-000000001680', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Matthew down', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:31:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1681-4000-8000-000000001681', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paula Navarro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:34:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1682-4000-8000-000000001682', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Luiza Braganca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:34:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1683-4000-8000-000000001683', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ana Paula Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1684-4000-8000-000000001684', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Eduarda Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1685-4000-8000-000000001685', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vanessa Mattos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1686-4000-8000-000000001686', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Camila Rodrigues Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1687-4000-8000-000000001687', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz Nogueira Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1688-4000-8000-000000001688', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Felipe Araujo Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1689-4000-8000-000000001689', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Juliana Pacheco Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1690-4000-8000-000000001690', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruno Teixeira Gomes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1691-4000-8000-000000001691', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Larissa Figueiredo Batista', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1692-4000-8000-000000001692', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego Martins Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1693-4000-8000-000000001693', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carolina Lopes Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1694-4000-8000-000000001694', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'André Vinícius Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1695-4000-8000-000000001695', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natália Guedes Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1696-4000-8000-000000001696', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Renata Campos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1697-4000-8000-000000001697', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Victor Hugo Rangel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Julia Galindo Hauret', '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1698-4000-8000-000000001698', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Priscila Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1699-4000-8000-000000001699', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriela Siqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1700-4000-8000-000000001700', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Daniela Moura Rezende', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1701-4000-8000-000000001701', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Karen Rosestolato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, 'Renata Lima', '2026-03-01T22:36:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1702-4000-8000-000000001702', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Amanda Gouveia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:36:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1703-4000-8000-000000001703', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Leandro Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:37:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1704-4000-8000-000000001704', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Danielle Mothe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:37:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1705-4000-8000-000000001705', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marina Aragao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1706-4000-8000-000000001706', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Maria Eugênia chialvo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1707-4000-8000-000000001707', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafaela Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1708-4000-8000-000000001708', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pamella Tozato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1709-4000-8000-000000001709', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Karoline Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1710-4000-8000-000000001710', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thiago Marcelo Lucca', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1711-4000-8000-000000001711', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Victor Ribas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1712-4000-8000-000000001712', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danielle Mothé', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1713-4000-8000-000000001713', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'raphael prazeres', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1714-4000-8000-000000001714', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isabela Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1715-4000-8000-000000001715', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Andrade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1716-4000-8000-000000001716', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Duda Rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1717-4000-8000-000000001717', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Helena Kass', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1718-4000-8000-000000001718', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Amanda Crispim Sampaio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1719-4000-8000-000000001719', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Julia Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1720-4000-8000-000000001720', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Beatriz Telles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1721-4000-8000-000000001721', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yuri Moss', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1722-4000-8000-000000001722', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Christina Neskaki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1723-4000-8000-000000001723', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Raphaela Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1724-4000-8000-000000001724', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Natasha lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1725-4000-8000-000000001725', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Cintia Aparecida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1726-4000-8000-000000001726', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'josilene castilho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1727-4000-8000-000000001727', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Catarina Nobre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1728-4000-8000-000000001728', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda Barqueta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1729-4000-8000-000000001729', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'giovanna santoloni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1730-4000-8000-000000001730', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'suelen bastos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:38:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1731-4000-8000-000000001731', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Priscilla Leal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:40:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1732-4000-8000-000000001732', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Giulia robles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:41:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1733-4000-8000-000000001733', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Gustavo Lisboa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:43:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1734-4000-8000-000000001734', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Allana Gomez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:43:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1735-4000-8000-000000001735', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Linhares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1736-4000-8000-000000001736', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1737-4000-8000-000000001737', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Caio Sales', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1738-4000-8000-000000001738', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carlos Eduardo Silva Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:49-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1739-4000-8000-000000001739', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Lorenna rosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1740-4000-8000-000000001740', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Júlia Victor', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:43:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1741-4000-8000-000000001741', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Pamela Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:44:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1742-4000-8000-000000001742', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Tatiany Aguiar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:44:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1743-4000-8000-000000001743', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Tatiana Beer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:44:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1744-4000-8000-000000001744', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Luana Bernat', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:44:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1745-4000-8000-000000001745', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Aline Dangelo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:45:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1746-4000-8000-000000001746', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Bianca Marchesano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T22:45:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1747-4000-8000-000000001747', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0013-4000-8000-000000000001', 'Marcelle Queiroz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:45:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1748-4000-8000-000000001748', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Luana de Souza Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:46:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1749-4000-8000-000000001749', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Pedro Magalhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:46:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1750-4000-8000-000000001750', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Clara Landim', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:47:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1751-4000-8000-000000001751', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ana Carolina Lara', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:47:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1752-4000-8000-000000001752', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Fernando Minnervini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:48:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1753-4000-8000-000000001753', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Leonardo Ferreira Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:48:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1754-4000-8000-000000001754', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Pedro Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:50:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1755-4000-8000-000000001755', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:51:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1756-4000-8000-000000001756', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Luana Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T22:52:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1757-4000-8000-000000001757', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Dan Worcman', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:52:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1758-4000-8000-000000001758', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Marcelo Bertoche', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:55:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1759-4000-8000-000000001759', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Machado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:57:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1760-4000-8000-000000001760', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Renata Palopoli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:57:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1761-4000-8000-000000001761', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julia Toledo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:57:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1762-4000-8000-000000001762', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Tais Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T22:57:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1763-4000-8000-000000001763', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Fabiana Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T22:58:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1764-4000-8000-000000001764', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Juliana Braz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T22:58:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1765-4000-8000-000000001765', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Douglas accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T22:59:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1766-4000-8000-000000001766', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Thiago Schmidt', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:01:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1767-4000-8000-000000001767', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Manoela Guarezi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:01:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1768-4000-8000-000000001768', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Guerrero', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:03:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1769-4000-8000-000000001769', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Luiza Mancini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:03:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1770-4000-8000-000000001770', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Diego ventura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:03:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1771-4000-8000-000000001771', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Edson rabelo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:04:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1772-4000-8000-000000001772', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Barbara Stringueta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:04:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1773-4000-8000-000000001773', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliana Bernardes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:05:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1774-4000-8000-000000001774', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Daniela Cantisano', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:05:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1775-4000-8000-000000001775', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Raphael Araripe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:05:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1776-4000-8000-000000001776', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Beatriz madruga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:06:21-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1777-4000-8000-000000001777', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Fabio Guimarães', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:06:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1778-4000-8000-000000001778', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Marcelo Neves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:07:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1779-4000-8000-000000001779', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Juliane Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:07:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1780-4000-8000-000000001780', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amanda Viana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:07:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1781-4000-8000-000000001781', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Felipe Chiba', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:09:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1782-4000-8000-000000001782', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Jessyca Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:09:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1783-4000-8000-000000001783', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Giuliana Piragibe', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:09:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1784-4000-8000-000000001784', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Renata Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1785-4000-8000-000000001785', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Fernando Anselmo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1786-4000-8000-000000001786', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Weber trindade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1787-4000-8000-000000001787', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0001-4000-8000-000000000001', 'Luciano Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1788-4000-8000-000000001788', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Andressa Célia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:10:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1789-4000-8000-000000001789', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Amanda Goulart', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:10:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1790-4000-8000-000000001790', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabel mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:11:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1791-4000-8000-000000001791', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Livia Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:11:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1792-4000-8000-000000001792', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marcelle Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:11:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1793-4000-8000-000000001793', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'joana machado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:12:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1794-4000-8000-000000001794', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'caroline valiante', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:12:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1795-4000-8000-000000001795', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'mariana padinha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:12:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1796-4000-8000-000000001796', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'anna luisa fazzolato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:12:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1797-4000-8000-000000001797', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Daniela Brant', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:13:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1798-4000-8000-000000001798', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carolina Porto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:13:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1799-4000-8000-000000001799', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Giosepe Celuppi Dal Vesco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:14:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1800-4000-8000-000000001800', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Igor Vasconcellos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:15:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1801-4000-8000-000000001801', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Eduarda Fraga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:15:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1802-4000-8000-000000001802', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela Marinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:15:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1803-4000-8000-000000001803', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Allan nesi', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T23:15:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1804-4000-8000-000000001804', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Hugo Susini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:15:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1805-4000-8000-000000001805', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bruno Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:15:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1806-4000-8000-000000001806', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nadja Eulalia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:15:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1807-4000-8000-000000001807', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Taynara Lima', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:15:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1808-4000-8000-000000001808', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karolliny Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:15:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1809-4000-8000-000000001809', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Karolyn Cambui', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:15:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1810-4000-8000-000000001810', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jéssica Távora', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1811-4000-8000-000000001811', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Bárbara gazal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1812-4000-8000-000000001812', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela Pinto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1813-4000-8000-000000001813', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Alessandro Paloma', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1814-4000-8000-000000001814', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Augusto almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1815-4000-8000-000000001815', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Telma Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1816-4000-8000-000000001816', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Judson Avellar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1817-4000-8000-000000001817', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Monique Barcelos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1818-4000-8000-000000001818', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Livia Benevenuto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1819-4000-8000-000000001819', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Marjorie Madeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1820-4000-8000-000000001820', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fernanda Martinez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1821-4000-8000-000000001821', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Louise Reis', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1822-4000-8000-000000001822', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rodrigo Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1823-4000-8000-000000001823', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ricardo Abrantes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1824-4000-8000-000000001824', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leandro Malaquias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1825-4000-8000-000000001825', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lays Roseno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1826-4000-8000-000000001826', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Graziela Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1827-4000-8000-000000001827', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Thaiana Seabra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1828-4000-8000-000000001828', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Gabriel Farias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1829-4000-8000-000000001829', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Wallace Brasil', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1830-4000-8000-000000001830', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Yasmin Pacheco', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1831-4000-8000-000000001831', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Moisés Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:16:35-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1832-4000-8000-000000001832', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0012-4000-8000-000000000001', 'Mariana Sena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:16:58-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1833-4000-8000-000000001833', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Carlos Alberto Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:17:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1834-4000-8000-000000001834', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruno Dantas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:17:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1835-4000-8000-000000001835', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Inez Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:17:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1836-4000-8000-000000001836', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Chaves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:17:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1837-4000-8000-000000001837', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rayane sobrinho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T23:17:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1838-4000-8000-000000001838', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Thadeu Carvalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:18:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1839-4000-8000-000000001839', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'julia simoes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:20:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1840-4000-8000-000000001840', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'anna carolina goncalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:20:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1841-4000-8000-000000001841', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'ines oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:20:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1842-4000-8000-000000001842', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'anna cataria heimlich', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:20:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1843-4000-8000-000000001843', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Diego Vinhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:20:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1844-4000-8000-000000001844', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alana Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:22:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1845-4000-8000-000000001845', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Veronica Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:22:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1846-4000-8000-000000001846', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Marcelo Pyl', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:22:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1847-4000-8000-000000001847', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucca Marins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:27:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1848-4000-8000-000000001848', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'leandro moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T23:27:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1849-4000-8000-000000001849', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Pywanne Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:28:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1850-4000-8000-000000001850', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Marcela Nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:28:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1851-4000-8000-000000001851', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Chloe disleire', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:28:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1852-4000-8000-000000001852', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna de Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:28:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1853-4000-8000-000000001853', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Paula da Silva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:28:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1854-4000-8000-000000001854', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fabianne Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:29:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1855-4000-8000-000000001855', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Daniel Loures', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:29:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1856-4000-8000-000000001856', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno coura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:29:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1857-4000-8000-000000001857', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Dennys Gomez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1858-4000-8000-000000001858', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Julia Mochizuk', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1859-4000-8000-000000001859', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aná camile', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1860-4000-8000-000000001860', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Leandro bugatti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1861-4000-8000-000000001861', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fiorella Oliva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1862-4000-8000-000000001862', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Elizabeth Oliva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1863-4000-8000-000000001863', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Isaac wentzien', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:30:12-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1864-4000-8000-000000001864', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Jean de Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:31:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1865-4000-8000-000000001865', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bernardo Balesteros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:31:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1866-4000-8000-000000001866', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Henrique Goiraieb', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:31:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1867-4000-8000-000000001867', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Aline Veiga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:31:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1868-4000-8000-000000001868', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Joao Vitor Terra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:31:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1869-4000-8000-000000001869', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Eduardo Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:31:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1870-4000-8000-000000001870', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0006-4000-8000-000000000001', 'Mario Mega', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:31:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1871-4000-8000-000000001871', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Carlos Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:32:06-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1872-4000-8000-000000001872', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafaela Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:33:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1873-4000-8000-000000001873', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Joao balesdent', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:33:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1874-4000-8000-000000001874', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Paula Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:34:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1875-4000-8000-000000001875', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Johann Bulgaris', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:34:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1876-4000-8000-000000001876', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Douglas Accioly', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:35:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1877-4000-8000-000000001877', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Bruna de Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:35:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1878-4000-8000-000000001878', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Kathyane mahi Souza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1879-4000-8000-000000001879', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rebeca Thalita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:38:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1880-4000-8000-000000001880', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Carlos Antaki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:38:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1881-4000-8000-000000001881', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinícius Exposito', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:38:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1882-4000-8000-000000001882', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Eduarda Moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:39:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1883-4000-8000-000000001883', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jully Suarez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:39:30-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1884-4000-8000-000000001884', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gustavo Casali', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-01T23:39:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1885-4000-8000-000000001885', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Maior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:39:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1886-4000-8000-000000001886', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gabriel Stephan', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:39:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1887-4000-8000-000000001887', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Arthur Penna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:39:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1888-4000-8000-000000001888', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Paula Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:40:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1889-4000-8000-000000001889', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Johann Burlgaris', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:40:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1890-4000-8000-000000001890', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Flaviana Favoreto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:44:08-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1891-4000-8000-000000001891', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Jorge Fernando Borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:44:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1892-4000-8000-000000001892', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Atilas Leonardo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:44:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1893-4000-8000-000000001893', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Luan Matheus', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:44:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1894-4000-8000-000000001894', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Mariane Barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:44:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1895-4000-8000-000000001895', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Roberta Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:44:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1896-4000-8000-000000001896', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Kassia evangelista', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:44:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1897-4000-8000-000000001897', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas Soares', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:45:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1898-4000-8000-000000001898', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Rafaela Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:46:32-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1899-4000-8000-000000001899', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Marcos Eugenio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1900-4000-8000-000000001900', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Andre Leao', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1901-4000-8000-000000001901', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Felipe Ramalho', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1902-4000-8000-000000001902', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Kethleen Jennifer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1903-4000-8000-000000001903', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Giulia Nogueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1904-4000-8000-000000001904', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Jessica Lemos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1905-4000-8000-000000001905', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Ana Katia Lemos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:47:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1906-4000-8000-000000001906', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rayssa Venancio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:47:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1907-4000-8000-000000001907', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Renata Machado', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:47:23-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1908-4000-8000-000000001908', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Taddeucci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:47:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1909-4000-8000-000000001909', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Gabriel lobato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:48:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1910-4000-8000-000000001910', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Brenno veras', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:48:10-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1911-4000-8000-000000001911', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Gabriela Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1912-4000-8000-000000001912', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Raquel Inocencio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1913-4000-8000-000000001913', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Mariane Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:50:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1914-4000-8000-000000001914', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Luciano Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Daniela', '2026-03-01T23:50:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1915-4000-8000-000000001915', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabela Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:52:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1916-4000-8000-000000001916', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:52:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1917-4000-8000-000000001917', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Leonardo pimenta rezende', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:52:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1918-4000-8000-000000001918', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Camila Alves da Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:53:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1919-4000-8000-000000001919', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rafael Lanhas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:55:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1920-4000-8000-000000001920', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rodrigo Souto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:55:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1921-4000-8000-000000001921', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Orestes Borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-01T23:55:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1922-4000-8000-000000001922', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gabriel Sathler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:56:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1923-4000-8000-000000001923', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Daniel Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:56:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1924-4000-8000-000000001924', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Andre Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-01T23:56:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1925-4000-8000-000000001925', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Paula Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:56:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1926-4000-8000-000000001926', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Johann Bulgaris', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:56:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1927-4000-8000-000000001927', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Gustavo j figueiredo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:57:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1928-4000-8000-000000001928', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Gustavo Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-01T23:57:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1929-4000-8000-000000001929', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabela Almeida', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:57:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1930-4000-8000-000000001930', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-01T23:57:38-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1931-4000-8000-000000001931', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Daniel souto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-01T23:57:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1932-4000-8000-000000001932', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Livia Benevenuto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1933-4000-8000-000000001933', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Carlaine Bezerra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1934-4000-8000-000000001934', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabryella Dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1935-4000-8000-000000001935', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Monique Barcelos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1936-4000-8000-000000001936', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Rafaela deterling', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1937-4000-8000-000000001937', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Marjorie Madeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1938-4000-8000-000000001938', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raphaela Motta', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:03:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1939-4000-8000-000000001939', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Michel Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:03:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1940-4000-8000-000000001940', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T00:07:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1941-4000-8000-000000001941', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Erica Affonso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T00:07:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1942-4000-8000-000000001942', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Gabriela Iglesias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:07:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1943-4000-8000-000000001943', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julienne Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:07:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1944-4000-8000-000000001944', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Ana Júlia Alencar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:07:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1945-4000-8000-000000001945', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Victor Borges', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:07:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1946-4000-8000-000000001946', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'rafaele nascimento', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:08:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1947-4000-8000-000000001947', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'suelen cristina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:08:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1948-4000-8000-000000001948', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'gabrielli santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:08:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1949-4000-8000-000000001949', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Carol Torturella', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1950-4000-8000-000000001950', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Carol vieira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1951-4000-8000-000000001951', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Fabi Simões', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1952-4000-8000-000000001952', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno heleno', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:09:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1953-4000-8000-000000001953', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Andre arteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:10:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1954-4000-8000-000000001954', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Sarah trindade', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:11:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1955-4000-8000-000000001955', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Tabatha Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:11:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1956-4000-8000-000000001956', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Beatriz Drummond', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:11:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1957-4000-8000-000000001957', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Caroline valcarcel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:12:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1958-4000-8000-000000001958', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Eduarda Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:12:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1959-4000-8000-000000001959', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Isabelle Mattos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:12:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1960-4000-8000-000000001960', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Fabio pereira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:13:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1961-4000-8000-000000001961', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Vanessa Magalhaes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:13:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1962-4000-8000-000000001962', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rodrigo Dacacche', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:13:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1963-4000-8000-000000001963', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Maicon santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:15:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1964-4000-8000-000000001964', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Danielle Ribeiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:17:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1965-4000-8000-000000001965', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Débora Gonzaga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:17:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1966-4000-8000-000000001966', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Darfiny Rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:20:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1967-4000-8000-000000001967', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rennan Moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:21:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1968-4000-8000-000000001968', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Gustavo Marques', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:21:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1969-4000-8000-000000001969', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:22:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1970-4000-8000-000000001970', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Igor scatena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:22:02-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1971-4000-8000-000000001971', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Bruno Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:22:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1972-4000-8000-000000001972', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Felipe Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:23:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1973-4000-8000-000000001973', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'José Luís Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:23:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1974-4000-8000-000000001974', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Lucas Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:23:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1975-4000-8000-000000001975', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Igor Scatena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:23:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1976-4000-8000-000000001976', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maiara Modenese', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:24:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1977-4000-8000-000000001977', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Fabio Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:26:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1978-4000-8000-000000001978', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Domingos Junior', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:26:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1979-4000-8000-000000001979', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Leonardo Pessoa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:26:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1980-4000-8000-000000001980', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Julio Maciel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:26:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1981-4000-8000-000000001981', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luiz Moretzsohn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:28:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1982-4000-8000-000000001982', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Amanda Niemeyer', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:28:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1983-4000-8000-000000001983', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Joanna Cardoso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:28:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1984-4000-8000-000000001984', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Laura Masetto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:28:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1985-4000-8000-000000001985', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Clara Telles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:28:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1986-4000-8000-000000001986', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Leticia Viana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:28:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1987-4000-8000-000000001987', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Julia Jacomini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:28:45-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1988-4000-8000-000000001988', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nathalia Ramos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:30:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1989-4000-8000-000000001989', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Alessandra Paiva', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:30:04-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1990-4000-8000-000000001990', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Rafaela Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:30:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1991-4000-8000-000000001991', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Fabio Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:31:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1992-4000-8000-000000001992', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'melinda santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:32:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1993-4000-8000-000000001993', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'maria eduarda barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:32:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1994-4000-8000-000000001994', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Jacopo Conceição', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:32:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1995-4000-8000-000000001995', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raka Minelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:33:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1996-4000-8000-000000001996', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Erika Tocci', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:33:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1997-4000-8000-000000001997', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Sabrina Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:33:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1998-4000-8000-000000001998', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caroline Rangel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:33:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-1999-4000-8000-000000001999', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Raissa Mello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:34:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2000-4000-8000-000000002000', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Filipe Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:34:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2001-4000-8000-000000002001', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Rafael Cardozo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:34:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2002-4000-8000-000000002002', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Ricardo Barroso', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:34:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2003-4000-8000-000000002003', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Matheus Pietra', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:34:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2004-4000-8000-000000002004', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Vinicius Mello', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:34:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2005-4000-8000-000000002005', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Thiago Vespa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:36:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2006-4000-8000-000000002006', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Tiago Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:36:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2007-4000-8000-000000002007', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Caio Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:36:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2008-4000-8000-000000002008', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Gustavo Esteves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:36:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2009-4000-8000-000000002009', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Taisa Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:37:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2010-4000-8000-000000002010', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raquel Santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:37:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2011-4000-8000-000000002011', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Mayara Cavalcanti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:37:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2012-4000-8000-000000002012', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Marya eduarda lobo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:37:07-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2013-4000-8000-000000002013', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Clarissa Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:37:55-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2014-4000-8000-000000002014', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Iury de Paula', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:37:56-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2015-4000-8000-000000002015', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Carlos Peçanha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2016-4000-8000-000000002016', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Vinicius Duque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2017-4000-8000-000000002017', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas Freitas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2018-4000-8000-000000002018', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Matheus Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2019-4000-8000-000000002019', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Lucas Moreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2020-4000-8000-000000002020', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Igor scatena', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:38:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2021-4000-8000-000000002021', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'melinda santos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:39:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2022-4000-8000-000000002022', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'maria eduarda barbosa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:39:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2023-4000-8000-000000002023', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Fernanda morelli', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:39:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2024-4000-8000-000000002024', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Mariana Cabral', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:39:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2025-4000-8000-000000002025', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Andrea delmondes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T00:39:53-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2026-4000-8000-000000002026', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Helio sadayuki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T00:40:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2027-4000-8000-000000002027', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Jessica Ninaut', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:41:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2028-4000-8000-000000002028', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Danilo Lopes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:41:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2029-4000-8000-000000002029', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Allan do Carmo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:41:16-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2030-4000-8000-000000002030', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Nathalia falcão', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:41:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2031-4000-8000-000000002031', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Carolina valente', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:41:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2032-4000-8000-000000002032', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Larissa Alves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:41:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2033-4000-8000-000000002033', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Giovanna Hissa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:41:59-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2034-4000-8000-000000002034', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Carlos Alvarez', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:42:05-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2035-4000-8000-000000002035', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Léo galo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:42:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2036-4000-8000-000000002036', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Léo Gallo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:42:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2037-4000-8000-000000002037', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Isabelle ettinger', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:42:54-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2038-4000-8000-000000002038', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Leonardo Gallo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:43:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2039-4000-8000-000000002039', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Beatriz Nunes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:44:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2040-4000-8000-000000002040', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Thaisa do Carmo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:44:26-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2041-4000-8000-000000002041', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Renata lins de Araujo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T00:44:28-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2042-4000-8000-000000002042', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Clara Sampaio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:45:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2043-4000-8000-000000002043', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Diego Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:45:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2044-4000-8000-000000002044', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Leonardo Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:45:29-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2045-4000-8000-000000002045', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Raphaela vianna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:50:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2046-4000-8000-000000002046', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Allan anjos', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T00:50:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2047-4000-8000-000000002047', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0005-4000-8000-000000000001', 'Liza Del Dala', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2048-4000-8000-000000002048', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0005-4000-8000-000000000001', 'Tabathie Del Dala', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2049-4000-8000-000000002049', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0005-4000-8000-000000000001', 'Diogo Almeida + 1', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2050-4000-8000-000000002050', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0005-4000-8000-000000000001', 'Maria Carol', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2051-4000-8000-000000002051', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0005-4000-8000-000000000001', 'Késsya Fernandes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2052-4000-8000-000000002052', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Lucas Barros Cunha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:52:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2053-4000-8000-000000002053', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'Vinicius Monteiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:56:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2054-4000-8000-000000002054', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Adriane Ferraz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:56:57-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2055-4000-8000-000000002055', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Rodrigo Dacacche', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:57:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2056-4000-8000-000000002056', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Giulia robles', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T00:59:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2057-4000-8000-000000002057', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Guilherme Rocha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T00:59:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2058-4000-8000-000000002058', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0011-4000-8000-000000000001', 'Leo Teixeira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T00:59:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2059-4000-8000-000000002059', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Laura Dimichino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T01:00:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2060-4000-8000-000000002060', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'Stefani Juric', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T01:00:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2061-4000-8000-000000002061', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Guilherme Abreu', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:04:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2062-4000-8000-000000002062', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Rennan moraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T01:06:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2063-4000-8000-000000002063', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ana beatriz cury', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:07:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2064-4000-8000-000000002064', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Julia cerqueira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:07:36-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2065-4000-8000-000000002065', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Bruno cruz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T01:08:03-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2066-4000-8000-000000002066', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Raquel Cristiny rocha Martins', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2067-4000-8000-000000002067', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Bruna Maciel Barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2068-4000-8000-000000002068', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Amram Vita', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2069-4000-8000-000000002069', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Paulo Garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2070-4000-8000-000000002070', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Matheus Leal', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2071-4000-8000-000000002071', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Pasquale Iovine', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:10:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2072-4000-8000-000000002072', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Yure guimaraes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:13:00-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2073-4000-8000-000000002073', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'David Zajac', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:17:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2074-4000-8000-000000002074', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Eduarda Duarte', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:19:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2075-4000-8000-000000002075', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Caroline Valcarcel', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:19:39-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2076-4000-8000-000000002076', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paula Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:20:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2077-4000-8000-000000002077', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paloma Carolina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:20:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2078-4000-8000-000000002078', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Manuela Pinheiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:20:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2079-4000-8000-000000002079', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Rayanne zanon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:20:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2080-4000-8000-000000002080', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paula Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:21:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2081-4000-8000-000000002081', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Paloma Carolina', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:21:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2082-4000-8000-000000002082', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Manuela Pinheiro', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:21:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2083-4000-8000-000000002083', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Rayanne zanon', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:21:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2084-4000-8000-000000002084', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Fernanda calazans', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:23:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2085-4000-8000-000000002085', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Luisa Braga', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T01:25:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2086-4000-8000-000000002086', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Isabella Tanizaki', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:25:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2087-4000-8000-000000002087', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Leticia avellar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:25:40-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2088-4000-8000-000000002088', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Antonio Divino', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:31:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2089-4000-8000-000000002089', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Diogo Tarre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:31:41-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2090-4000-8000-000000002090', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gloria albuquerque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:31:46-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2091-4000-8000-000000002091', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Luiz Moretzsohn', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:32:09-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2092-4000-8000-000000002092', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Etiene Mascarenhas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T01:32:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2093-4000-8000-000000002093', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Erica Ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T01:32:18-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2094-4000-8000-000000002094', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Maria Eduarda Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:33:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2095-4000-8000-000000002095', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gloria Buarque', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T01:33:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2096-4000-8000-000000002096', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0014-4000-8000-000000000001', 'Maria Eduarda Gonçalves', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:39:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2097-4000-8000-000000002097', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Paulo manholetti', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:46:22-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2098-4000-8000-000000002098', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Josieli cerini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:47:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2099-4000-8000-000000002099', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Mariana flores', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:47:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2100-4000-8000-000000002100', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'raphaela zonatto', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:47:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2101-4000-8000-000000002101', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'valentina villela', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T01:47:01-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2102-4000-8000-000000002102', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Pamella Braz', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T01:48:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2103-4000-8000-000000002103', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Kelly Alencar', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T01:48:42-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2104-4000-8000-000000002104', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Camila Santiago', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T01:59:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2105-4000-8000-000000002105', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Mariah Marini', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T02:00:27-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2106-4000-8000-000000002106', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Lucca Fortuna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T02:00:44-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2107-4000-8000-000000002107', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Duarte Moura', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T02:01:43-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2108-4000-8000-000000002108', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Lara Kubas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T02:07:13-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2109-4000-8000-000000002109', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'yasmin ferreira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2110-4000-8000-000000002110', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'marianna gadelha', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2111-4000-8000-000000002111', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'anna silvestrin', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2112-4000-8000-000000002112', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0002-4000-8000-000000000001', 'axelle van meegenburg', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Thalyta Garcia', '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2113-4000-8000-000000002113', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'pedro dias', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2114-4000-8000-000000002114', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'aron hammond', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2115-4000-8000-000000002115', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0003-4000-8000-000000000001', 'nicu bakhtiari', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T02:11:34-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2116-4000-8000-000000002116', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Antony Kubas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T02:13:31-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2117-4000-8000-000000002117', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Stepanni Jur', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:13:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2118-4000-8000-000000002118', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Laura Jur', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:13:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2119-4000-8000-000000002119', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Veronica Costa', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:15:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2120-4000-8000-000000002120', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Priscila Faria', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:15:48-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2121-4000-8000-000000002121', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Priscilla lavalle', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Clara Morini', '2026-03-02T02:17:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2122-4000-8000-000000002122', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Barbara Carloni', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T02:17:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2123-4000-8000-000000002123', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Rebecca maestrali', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:17:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2124-4000-8000-000000002124', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Ilana onofre', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:18:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2125-4000-8000-000000002125', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Thyago tuler', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T02:22:20-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2126-4000-8000-000000002126', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Luís Barreiros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:25:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2127-4000-8000-000000002127', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Waleska kotlowski', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:35:47-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2128-4000-8000-000000002128', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Alexsandra Vianna', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:36:15-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2129-4000-8000-000000002129', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Maria Paula Varela Barboza', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T02:37:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2130-4000-8000-000000002130', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Emellyn Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:37:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2131-4000-8000-000000002131', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabriela Santana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:37:52-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2132-4000-8000-000000002132', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Emellyn Oliveira', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:38:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2133-4000-8000-000000002133', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Gabriela Santana', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:38:19-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2134-4000-8000-000000002134', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Suelen Polanczyk', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:49:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2135-4000-8000-000000002135', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Letícia Azevedo', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:49:24-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2136-4000-8000-000000002136', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0010-4000-8000-000000000001', 'Fabiano Menezes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:49:37-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2137-4000-8000-000000002137', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Sophia Rech', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:53:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2138-4000-8000-000000002138', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Larissa Vitória de Abreu Batista', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T02:53:17-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2139-4000-8000-000000002139', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'Karen Rosestolato', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Julia Galindo Hauret', '2026-03-02T02:56:14-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2140-4000-8000-000000002140', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'amanda viegas', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:56:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2141-4000-8000-000000002141', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'manuela maia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:56:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2142-4000-8000-000000002142', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0008-4000-8000-000000000001', 'pamela rodrigues', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T02:56:51-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2143-4000-8000-000000002143', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'adnan muchaluat', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Elloah Castro', '2026-03-02T03:00:33-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2144-4000-8000-000000002144', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'matheus mee', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', true, '2026-03-01T23:30:00-03:00', 'Renata Lima', '2026-03-02T03:16:25-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2145-4000-8000-000000002145', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Julio barros', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T03:26:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2146-4000-8000-000000002146', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Bruno garcia', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T03:26:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2147-4000-8000-000000002147', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0007-4000-8000-000000000001', 'Miguel sampaio', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T03:26:11-03:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO convidados_lista (id, lista_id, regra_id, nome, inserido_por, checked_in, checked_in_em, checked_in_por_nome, created_at)
VALUES ('d0d0d0d0-2148-4000-8000-000000002148', 'b0b0b0b0-0001-4000-8000-000000000001', 'c0c0c0c0-0009-4000-8000-000000000001', 'Diogo Mendes', 'ecee77b5-9edf-4339-99f1-968cd9c5c34b', false, NULL, NULL, '2026-03-02T03:59:18-03:00')
ON CONFLICT (id) DO NOTHING;

COMMIT;