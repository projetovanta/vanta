-- Configuração editável do clube MAIS VANTA por comunidade
CREATE TABLE IF NOT EXISTS clube_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,

  -- Benefícios por tier (texto livre editável pelo master)
  beneficios_bronze TEXT DEFAULT 'Acesso a eventos selecionados com 1 ingresso cortesia',
  beneficios_prata TEXT DEFAULT 'Todos os benefícios Bronze + prioridade na reserva + 1 acompanhante',
  beneficios_ouro TEXT DEFAULT 'Todos os benefícios Prata + acesso VIP + reserva antecipada',
  beneficios_diamante TEXT DEFAULT 'Acesso total + acompanhante ilimitado + prioridade máxima',

  -- Limite de membros por tier (0 = ilimitado)
  limite_bronze INT DEFAULT 0,
  limite_prata INT DEFAULT 0,
  limite_ouro INT DEFAULT 0,
  limite_diamante INT DEFAULT 0,

  -- Regras gerais
  prazo_post_horas INT DEFAULT 12,           -- horas para postar após evento
  dias_castigo INT DEFAULT 30,               -- dias de bloqueio por no-show
  acompanhante_padrao BOOLEAN DEFAULT false,  -- permitir +1 por padrão nos lotes

  atualizado_em TIMESTAMPTZ DEFAULT now(),

  UNIQUE(comunidade_id)
);

-- RLS
ALTER TABLE clube_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clube_config_read" ON clube_config
  FOR SELECT USING (true);

CREATE POLICY "clube_config_write" ON clube_config
  FOR ALL USING (true) WITH CHECK (true);
