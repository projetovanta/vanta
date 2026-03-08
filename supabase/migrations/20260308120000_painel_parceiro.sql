-- ============================================================
-- PAINEL DO PARCEIRO — RLS + policies pra parceiro acessar seus dados
-- ============================================================

-- Parceiro pode ver seu próprio registro
CREATE POLICY parceiros_mv_own_read ON public.parceiros_mais_vanta
  FOR SELECT USING (user_id = auth.uid());

-- Parceiro pode ver seus próprios deals
CREATE POLICY deals_mv_parceiro_read ON public.deals_mais_vanta
  FOR SELECT USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros_mais_vanta WHERE user_id = auth.uid()
    )
  );

-- Parceiro pode inserir deals com status RASCUNHO (sugestão pro master)
CREATE POLICY deals_mv_parceiro_insert ON public.deals_mais_vanta
  FOR INSERT WITH CHECK (
    parceiro_id IN (
      SELECT id FROM public.parceiros_mais_vanta WHERE user_id = auth.uid()
    )
    AND status = 'RASCUNHO'
  );

-- Parceiro pode ver resgates dos seus deals
CREATE POLICY resgates_mv_parceiro_read ON public.resgates_mais_vanta
  FOR SELECT USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros_mais_vanta WHERE user_id = auth.uid()
    )
  );

-- Notificação pro master quando parceiro sugere deal
-- (será feita via trigger)
CREATE OR REPLACE FUNCTION public.notificar_deal_sugerido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parceiro_nome TEXT;
  v_masters RECORD;
BEGIN
  IF NEW.status = 'RASCUNHO' THEN
    SELECT nome INTO v_parceiro_nome FROM parceiros_mais_vanta WHERE id = NEW.parceiro_id;

    FOR v_masters IN SELECT id FROM profiles WHERE role = 'master' LOOP
      INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, created_at)
      VALUES (
        v_masters.id,
        'MV_DEAL_SUGERIDO',
        'Novo deal sugerido',
        COALESCE(v_parceiro_nome, 'Parceiro') || ' sugeriu um deal: ' || COALESCE(NEW.titulo, 'Sem título'),
        false,
        now()
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deal_sugerido
  AFTER INSERT ON public.deals_mais_vanta
  FOR EACH ROW
  WHEN (NEW.status = 'RASCUNHO')
  EXECUTE FUNCTION public.notificar_deal_sugerido();
