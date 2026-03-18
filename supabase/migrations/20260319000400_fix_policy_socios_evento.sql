-- Fix C12: Policy socios_evento_admin_all usa cargos inexistentes ('master_admin', 'admin')
-- Corrigir para: masteradm via profiles.role + GERENTE via atribuicoes_rbac na comunidade do evento

DROP POLICY IF EXISTS socios_evento_admin_all ON socios_evento;
CREATE POLICY socios_evento_admin_all ON socios_evento
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    OR
    EXISTS (
      SELECT 1 FROM atribuicoes_rbac ar
      JOIN eventos_admin ea ON ea.comunidade_id = ar.tenant_id
      WHERE ar.user_id = auth.uid()
        AND ar.tenant_type = 'COMUNIDADE'
        AND ea.id = socios_evento.evento_id
        AND ar.cargo = 'GERENTE'
        AND ar.ativo = true
    )
  );
