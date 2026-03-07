-- Cupons / Códigos Promocionais
CREATE TABLE IF NOT EXISTS cupons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT NOT NULL UNIQUE,
  tipo          TEXT NOT NULL DEFAULT 'PERCENTUAL',   -- PERCENTUAL | FIXO
  valor         NUMERIC(10,2) NOT NULL DEFAULT 0,     -- % ou R$
  limite_usos   INT,                                   -- NULL = ilimitado
  usos          INT NOT NULL DEFAULT 0,
  evento_id     UUID REFERENCES eventos_admin(id) ON DELETE CASCADE,
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  valido_ate    TIMESTAMPTZ,                           -- NULL = sem validade
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_por    UUID NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;

-- Leitura pública (checkout precisa validar cupom)
CREATE POLICY "cupons_select" ON cupons FOR SELECT USING (true);

-- Escrita: apenas autenticados (admin)
CREATE POLICY "cupons_admin" ON cupons FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_cupons_codigo ON cupons(codigo);
CREATE INDEX idx_cupons_evento ON cupons(evento_id);

-- RPC atômico para incrementar usos (evita race condition)
CREATE OR REPLACE FUNCTION incrementar_usos_cupom(cupom_id UUID)
RETURNS VOID AS $$
  UPDATE cupons SET usos = usos + 1 WHERE id = cupom_id;
$$ LANGUAGE sql SECURITY DEFINER;
