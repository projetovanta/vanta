-- Migration: Fix search_path em 5 RPCs SECURITY DEFINER + restringir 2 policies SELECT abertas
-- Sessão 18 — Auditoria Supabase x Código

-- ============================
-- PARTE 1: SET search_path em RPCs SECURITY DEFINER
-- ============================

ALTER FUNCTION public.criar_comunidade_completa SET search_path = public;
ALTER FUNCTION public.criar_evento_completo SET search_path = public;
ALTER FUNCTION public.eventos_recomendados_behavior SET search_path = public;
ALTER FUNCTION public.processar_compra_checkout SET search_path = public;
ALTER FUNCTION public.search_users SET search_path = public;

-- ============================
-- PARTE 2: Restringir policies SELECT abertas
-- ============================

-- assinaturas_mais_vanta: era SELECT USING (true) — expunha dados de todas as comunidades
DROP POLICY IF EXISTS "assinaturas_mais_vanta_select" ON public.assinaturas_mais_vanta;
CREATE POLICY "assinaturas_mais_vanta_select" ON public.assinaturas_mais_vanta
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.atribuicoes_rbac
      WHERE tenant_id = comunidade_id AND ativo = true
    )
    OR public.is_masteradm()
  );

-- passport_aprovacoes: era SELECT USING (true) — expunha aprovações de todos
DROP POLICY IF EXISTS "passport_aprovacoes_select" ON public.passport_aprovacoes;
CREATE POLICY "passport_aprovacoes_select" ON public.passport_aprovacoes
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_masteradm()
  );
