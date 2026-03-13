-- Migration: Recriar views sem SECURITY DEFINER
-- Motivo: Supabase advisor ERROR — views SECURITY DEFINER executam com permissões do criador

-- 1. comunidades_admin — filtro por acesso (mantém lógica, remove SECURITY DEFINER)
DROP VIEW IF EXISTS comunidades_admin;
CREATE VIEW comunidades_admin AS
SELECT id, nome, descricao, cidade, estado, endereco, foto, foto_capa, coords,
       capacidade_max, ativa, cargos_customizados, created_by, created_at, updated_at,
       vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode, dono_id,
       tier_minimo_mais_vanta, horario_funcionamento, horario_overrides,
       cep, slug, cnpj, razao_social, telefone,
       vanta_fee_repasse_percent, tipo_comunidade,
       taxa_processamento_percent, taxa_porta_percent, taxa_minima,
       cota_nomes_lista, taxa_nome_excedente, cota_cortesias, taxa_cortesia_excedente_pct,
       evento_privado_ativo, evento_privado_texto, evento_privado_fotos,
       evento_privado_formatos, evento_privado_atracoes, evento_privado_faixas_capacidade
FROM comunidades
WHERE is_masteradm()
   OR has_plataforma_permission('GERIR_COMUNIDADES')
   OR EXISTS (
     SELECT 1 FROM atribuicoes_rbac
     WHERE atribuicoes_rbac.user_id = auth.uid()
       AND atribuicoes_rbac.tenant_type = 'COMUNIDADE'
       AND atribuicoes_rbac.tenant_id = comunidades.id
       AND atribuicoes_rbac.ativo = true
   )
   OR created_by = auth.uid()
   OR dono_id = auth.uid();

-- 2. comunidades_publico — dados públicos, sem filtro (OK expor campos públicos)
DROP VIEW IF EXISTS comunidades_publico;
CREATE VIEW comunidades_publico AS
SELECT id, nome, descricao, cidade, estado, endereco, foto, foto_capa, coords,
       capacidade_max, ativa, slug, tipo_comunidade, tier_minimo_mais_vanta,
       horario_funcionamento, horario_overrides,
       evento_privado_ativo, evento_privado_texto, evento_privado_fotos,
       evento_privado_formatos, evento_privado_atracoes, evento_privado_faixas_capacidade,
       created_at, updated_at
FROM comunidades;

-- Grant select para roles autenticadas e anônimas
GRANT SELECT ON comunidades_admin TO authenticated;
GRANT SELECT ON comunidades_publico TO authenticated, anon;
