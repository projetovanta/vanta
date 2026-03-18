-- Fix A12: transferencias_ingresso usa TEXT para ticket_id/evento_id — converter pra UUID + FKs
ALTER TABLE transferencias_ingresso
  ALTER COLUMN ticket_id TYPE UUID USING ticket_id::uuid,
  ALTER COLUMN evento_id TYPE UUID USING evento_id::uuid;

ALTER TABLE transferencias_ingresso
  ADD CONSTRAINT fk_transf_ticket FOREIGN KEY (ticket_id) REFERENCES tickets_caixa(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_transf_evento FOREIGN KEY (evento_id) REFERENCES eventos_admin(id) ON DELETE RESTRICT;
