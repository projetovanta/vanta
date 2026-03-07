-- Migration: Create reembolsos table (simplificado)
-- Date: 2026-03-01

-- Criar tabela reembolsos
DROP TABLE IF EXISTS public.reembolsos CASCADE;

CREATE TABLE IF NOT EXISTS public.reembolsos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL UNIQUE,
  evento_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('AUTOMATICO', 'MANUAL')),
  status TEXT NOT NULL DEFAULT 'PENDENTE_APROVACAO' CHECK (status IN ('PENDENTE_APROVACAO', 'APROVADO', 'REJEITADO')),
  motivo TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  solicitado_por UUID NOT NULL,
  aprovado_por UUID,
  rejeitado_por UUID,
  solicitado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processado_em TIMESTAMPTZ,
  rejeitado_em TIMESTAMPTZ,
  rejeitado_motivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_ticket_id FOREIGN KEY (ticket_id) REFERENCES public.tickets_caixa(id) ON DELETE CASCADE,
  CONSTRAINT fk_evento_id FOREIGN KEY (evento_id) REFERENCES public.eventos_admin(id) ON DELETE CASCADE,
  CONSTRAINT fk_solicitado_por FOREIGN KEY (solicitado_por) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_aprovado_por FOREIGN KEY (aprovado_por) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT fk_rejeitado_por FOREIGN KEY (rejeitado_por) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reembolsos_evento_id ON public.reembolsos(evento_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_ticket_id ON public.reembolsos(ticket_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_solicitado_por ON public.reembolsos(solicitado_por);
CREATE INDEX IF NOT EXISTS idx_reembolsos_tipo ON public.reembolsos(tipo);
CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON public.reembolsos(status);

-- Enable RLS
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;

-- Policies simplificadas
CREATE POLICY "reembolsos_select" ON public.reembolsos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reembolsos_insert" ON public.reembolsos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reembolsos_update" ON public.reembolsos FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
