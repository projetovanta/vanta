-- Migration: Condições Comerciais — fluxo de aceite formal

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS condicoes_comerciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,

  taxa_servico_percent NUMERIC(5,4),
  taxa_processamento_percent NUMERIC(5,4),
  taxa_porta_percent NUMERIC(5,4),
  taxa_minima NUMERIC(10,2),
  taxa_fixa_evento NUMERIC(10,2) DEFAULT 0,
  quem_paga_servico TEXT DEFAULT 'PRODUTOR_ESCOLHE',
  cota_nomes_lista INTEGER,
  taxa_nome_excedente NUMERIC(10,2),
  cota_cortesias INTEGER,
  taxa_cortesia_excedente_pct NUMERIC(5,4),
  prazo_pagamento_dias INTEGER,

  definido_por UUID NOT NULL REFERENCES auth.users(id),
  definido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'PENDENTE'
    CHECK (status IN ('PENDENTE', 'ACEITO', 'RECUSADO', 'EXPIRADO')),
  aceito_por UUID REFERENCES auth.users(id),
  aceito_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  motivo_recusa TEXT,
  observacoes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_condicoes_comunidade
  ON condicoes_comerciais(comunidade_id, status);

CREATE INDEX IF NOT EXISTS idx_condicoes_expiracao
  ON condicoes_comerciais(status, expira_em)
  WHERE status = 'PENDENTE';

-- 2. Campos de status na tabela comunidades
ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS condicoes_status TEXT DEFAULT 'SEM_CONDICOES';

ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS condicoes_aceitas_em TIMESTAMPTZ;

-- 3. RLS
ALTER TABLE condicoes_comerciais ENABLE ROW LEVEL SECURITY;

CREATE POLICY condicoes_master_all ON condicoes_comerciais
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'vanta_masteradm'
    )
  );

CREATE POLICY condicoes_responsavel_select ON condicoes_comerciais
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac
      WHERE atribuicoes_rbac.tenant_id = condicoes_comerciais.comunidade_id
        AND atribuicoes_rbac.tenant_type = 'COMUNIDADE'
        AND atribuicoes_rbac.user_id = auth.uid()
        AND atribuicoes_rbac.ativo = true
    )
    OR
    EXISTS (
      SELECT 1 FROM comunidades
      WHERE comunidades.id = condicoes_comerciais.comunidade_id
        AND comunidades.dono_id = auth.uid()
    )
  );

CREATE POLICY condicoes_responsavel_update ON condicoes_comerciais
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac
      WHERE atribuicoes_rbac.tenant_id = condicoes_comerciais.comunidade_id
        AND atribuicoes_rbac.tenant_type = 'COMUNIDADE'
        AND atribuicoes_rbac.user_id = auth.uid()
        AND atribuicoes_rbac.ativo = true
    )
    OR
    EXISTS (
      SELECT 1 FROM comunidades
      WHERE comunidades.id = condicoes_comerciais.comunidade_id
        AND comunidades.dono_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('ACEITO', 'RECUSADO')
  );
