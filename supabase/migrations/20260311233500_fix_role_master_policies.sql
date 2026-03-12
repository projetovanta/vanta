-- Fix: role = 'master' → 'vanta_masteradm' em 3 policies/triggers
-- Afetados: convites_mais_vanta, denuncias, trg_deal_sugerido

-- 1. convites_mais_vanta
DROP POLICY IF EXISTS convites_mv_master_all ON public.convites_mais_vanta;
CREATE POLICY convites_mv_master_all ON public.convites_mais_vanta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'vanta_masteradm'
    )
  );

-- 2. denuncias
DROP POLICY IF EXISTS "denuncias_select_admin" ON denuncias;
CREATE POLICY "denuncias_select_admin" ON denuncias
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vanta_masteradm'
    )
  );

-- 3. trigger trg_deal_sugerido
CREATE OR REPLACE FUNCTION public.trg_deal_sugerido() RETURNS TRIGGER AS $$
DECLARE
  v_parceiro_nome TEXT;
  v_masters RECORD;
BEGIN
  IF NEW.status = 'RASCUNHO' THEN
    SELECT nome INTO v_parceiro_nome FROM parceiros_mais_vanta WHERE id = NEW.parceiro_id;

    FOR v_masters IN SELECT id FROM profiles WHERE role = 'vanta_masteradm' LOOP
      INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, created_at)
      VALUES (
        v_masters.id,
        'MV_DEAL_SUGERIDO',
        'Novo deal sugerido',
        v_parceiro_nome || ' sugeriu um novo deal para aprovação.',
        false,
        now()
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
