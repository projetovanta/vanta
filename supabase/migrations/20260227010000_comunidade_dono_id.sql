-- Adicionar coluna dono_id para transferência de titularidade
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS dono_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Inicializar dono_id com created_by para comunidades existentes
UPDATE comunidades SET dono_id = created_by WHERE dono_id IS NULL AND created_by IS NOT NULL;
