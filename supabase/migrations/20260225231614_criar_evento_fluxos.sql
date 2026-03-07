-- Migration: CriarEventoView — Dois Fluxos (Com Sócio / Festa da Casa)
-- Adiciona 6 colunas em eventos_admin para suportar fluxo COM_SOCIO e FESTA_DA_CASA

-- Tipo do fluxo escolhido ao criar
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS tipo_fluxo TEXT DEFAULT NULL;

-- Status do ciclo de vida do evento
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS status_evento TEXT DEFAULT 'PENDENTE';

-- userId do sócio convidado (fluxo COM_SOCIO)
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS socio_convidado_id UUID DEFAULT NULL REFERENCES auth.users(id);

-- Split financeiro: percentuais (ex: 70 + 30 = 100)
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS split_produtor INTEGER DEFAULT NULL;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS split_socio INTEGER DEFAULT NULL;

-- Permissões toggleadas pelo produtor (array de strings)
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS permissoes_produtor TEXT[] DEFAULT NULL;

-- Constraint: tipo_fluxo só aceita valores válidos
DO $$ BEGIN
  ALTER TABLE eventos_admin ADD CONSTRAINT chk_tipo_fluxo
    CHECK (tipo_fluxo IS NULL OR tipo_fluxo IN ('COM_SOCIO', 'FESTA_DA_CASA'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Constraint: status_evento só aceita valores válidos
DO $$ BEGIN
  ALTER TABLE eventos_admin ADD CONSTRAINT chk_status_evento
    CHECK (status_evento IS NULL OR status_evento IN (
      'RASCUNHO', 'PENDENTE', 'NEGOCIANDO', 'ATIVO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Constraint: split deve somar 100 quando ambos definidos
DO $$ BEGIN
  ALTER TABLE eventos_admin ADD CONSTRAINT chk_split_soma
    CHECK (
      (split_produtor IS NULL AND split_socio IS NULL)
      OR (split_produtor + split_socio = 100)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index para queries por status
CREATE INDEX IF NOT EXISTS idx_eventos_status_evento ON eventos_admin(status_evento);

-- Index para queries por sócio convidado
CREATE INDEX IF NOT EXISTS idx_eventos_socio_convidado ON eventos_admin(socio_convidado_id) WHERE socio_convidado_id IS NOT NULL;
