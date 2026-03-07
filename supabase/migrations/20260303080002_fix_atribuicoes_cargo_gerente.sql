-- Fix: cargo PRODUTOR → GERENTE nas atribuicoes_rbac (RBAC definitivo)
UPDATE atribuicoes_rbac SET cargo = 'GERENTE', updated_at = now()
WHERE cargo = 'PRODUTOR';

-- Fix: cargo PORTARIA → PORTARIA_LISTA nas atribuicoes_rbac
UPDATE atribuicoes_rbac SET cargo = 'PORTARIA_LISTA', updated_at = now()
WHERE cargo = 'PORTARIA';

-- Fix: cargo STAFF → GERENTE (legado)
UPDATE atribuicoes_rbac SET cargo = 'GERENTE', updated_at = now()
WHERE cargo = 'STAFF';
