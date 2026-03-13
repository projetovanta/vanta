-- Reembolso: cadeia hierárquica sócio → gerente → master
-- Remover AUTOMATICO_CDC (nunca usado), manter os demais.

-- Atualizar CHECK de status
ALTER TABLE reembolsos DROP CONSTRAINT IF EXISTS reembolsos_status_check;
ALTER TABLE reembolsos ADD CONSTRAINT reembolsos_status_check
  CHECK (status IN (
    'PENDENTE_APROVACAO',
    'AGUARDANDO_SOCIO',
    'AGUARDANDO_GERENTE',
    'AGUARDANDO_MASTER',
    'APROVADO',
    'REJEITADO'
  ));

-- Policy: sócio/gerente podem atualizar reembolsos quando é a vez deles
-- Usando has_evento_access para verificar que o user tem acesso ao evento
CREATE POLICY "reembolsos_update_socio_gerente" ON reembolsos
  FOR UPDATE USING (
    is_event_team_member(evento_id) OR is_masteradm()
  ) WITH CHECK (
    is_event_team_member(evento_id) OR is_masteradm()
  );
