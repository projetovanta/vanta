-- Tornar limites de lista opcionais (sem limite = ilimitado)
ALTER TABLE listas_evento ALTER COLUMN teto_global_total DROP NOT NULL;
ALTER TABLE regras_lista ALTER COLUMN teto_global DROP NOT NULL;
ALTER TABLE regras_lista ALTER COLUMN saldo_banco DROP NOT NULL;
