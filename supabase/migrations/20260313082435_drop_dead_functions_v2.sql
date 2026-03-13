-- Migration: Dropar funções mortas / quebradas + corrigir search_path de is_event_manager_or_admin
-- Motivo: Dead code + vulnerabilidade search_path

-- 1. reiniciar_negociacao — QUEBRADA (referencia ultimo_turno que foi dropado) + dead code
DROP FUNCTION IF EXISTS public.reiniciar_negociacao(uuid, uuid, integer, text);

-- 2. get_convite_socio — dead code (só existe em types/supabase.ts gerado)
DROP FUNCTION IF EXISTS public.get_convite_socio(uuid);

-- 3. processar_compra_checkout overload antigo (sem p_ref_code)
DROP FUNCTION IF EXISTS public.processar_compra_checkout(uuid, uuid, uuid, text, numeric, integer, uuid, numeric);

-- 4. is_event_manager_or_admin — NÃO é dead code (usada em 6 policies), apenas corrigir search_path
CREATE OR REPLACE FUNCTION public.is_event_manager_or_admin(p_evento_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    is_masteradm()
    OR EXISTS (
      SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM equipe_evento
      WHERE evento_id = p_evento_id
        AND membro_id = auth.uid()
        AND papel IN ('GERENTE', 'SOCIO')
    );
$function$;
