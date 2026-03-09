-- SEC-2: Restringir policies FOR ALL USING (true) para apenas master_admin
-- Tabelas afetadas: formatos, estilos, experiencias, categorias_evento, clube_config
-- Antes: qualquer autenticado podia INSERT/UPDATE/DELETE
-- Depois: apenas vanta_masteradm pode escrever

-- ── formatos ──
DROP POLICY IF EXISTS "master_write" ON public.formatos;
CREATE POLICY "master_write" ON public.formatos
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── estilos ──
DROP POLICY IF EXISTS "master_write" ON public.estilos;
CREATE POLICY "master_write" ON public.estilos
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── experiencias ──
DROP POLICY IF EXISTS "master_write" ON public.experiencias;
CREATE POLICY "master_write" ON public.experiencias
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── categorias_evento ──
DROP POLICY IF EXISTS "master_write" ON public.categorias_evento;
CREATE POLICY "master_write" ON public.categorias_evento
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- ── clube_config ──
DROP POLICY IF EXISTS "clube_config_write" ON public.clube_config;
CREATE POLICY "clube_config_write" ON public.clube_config
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
