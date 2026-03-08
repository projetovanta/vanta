-- Permitir leitura publica (anon) de cards ativos do Vanta Indica
-- Visitantes sem cadastro precisam ver os cards na Home

DROP POLICY IF EXISTS "indica_select_anon" ON vanta_indica;
CREATE POLICY "indica_select_anon"
  ON vanta_indica FOR SELECT TO anon
  USING (ativo = true);
