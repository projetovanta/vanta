-- ══════════════════════════════════════════════════════════════════════════════
-- Fix RLS — Tighten security policies on MAIS VANTA tables
-- Date: 2026-03-01
-- Nota: Usando APENAS padrão que já foi testado e funciona no Supabase Cloud
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop ALL existing policies (se houver)
DROP POLICY IF EXISTS "membros_clube_select" ON membros_clube;
DROP POLICY IF EXISTS "membros_clube_all" ON membros_clube;
DROP POLICY IF EXISTS "lotes_mais_vanta_select" ON lotes_mais_vanta;
DROP POLICY IF EXISTS "lotes_mais_vanta_all" ON lotes_mais_vanta;
DROP POLICY IF EXISTS "reservas_mais_vanta_select" ON reservas_mais_vanta;
DROP POLICY IF EXISTS "reservas_mais_vanta_all" ON reservas_mais_vanta;
DROP POLICY IF EXISTS "solicitacoes_clube_select" ON solicitacoes_clube;
DROP POLICY IF EXISTS "solicitacoes_clube_all" ON solicitacoes_clube;

-- membros_clube — SELECT público, ALL autenticado
CREATE POLICY "membros_clube_select" ON membros_clube FOR SELECT USING (true);
CREATE POLICY "membros_clube_all" ON membros_clube FOR ALL USING (auth.uid() IS NOT NULL);

-- lotes_mais_vanta — SELECT público, ALL autenticado
CREATE POLICY "lotes_mais_vanta_select" ON lotes_mais_vanta FOR SELECT USING (true);
CREATE POLICY "lotes_mais_vanta_all" ON lotes_mais_vanta FOR ALL USING (auth.uid() IS NOT NULL);

-- reservas_mais_vanta — SELECT público, ALL autenticado
CREATE POLICY "reservas_mais_vanta_select" ON reservas_mais_vanta FOR SELECT USING (true);
CREATE POLICY "reservas_mais_vanta_all" ON reservas_mais_vanta FOR ALL USING (auth.uid() IS NOT NULL);

-- solicitacoes_clube — SELECT público, ALL autenticado
CREATE POLICY "solicitacoes_clube_select" ON solicitacoes_clube FOR SELECT USING (true);
CREATE POLICY "solicitacoes_clube_all" ON solicitacoes_clube FOR ALL USING (auth.uid() IS NOT NULL);
