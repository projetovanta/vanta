# PROMPT — FASE 1: MIGRATION MAIS VANTA
> Colar no Claude Code (VS Code terminal)  
> Uma migration única, atômica, com rollback seguro

---

## CONTEXTO

Estamos reestruturando o banco de dados do programa MAIS VANTA no projeto VANTA (Supabase + Postgres). Esta é a Fase 1 — apenas banco de dados, zero mudança no frontend.

**REGRA MÁXIMA:** Antes de qualquer coisa, leia os arquivos relevantes. Nunca suponha o estado atual do banco. Verifique sempre.

---

## ANTES DE COMEÇAR — LEITURA OBRIGATÓRIA

Leia estes arquivos na ordem:

1. `supabase/migrations/` — listar todos os arquivos, identificar as migrations que tocam em: `membros_clube`, `lotes_mais_vanta`, `solicitacoes_clube`, `tiers_mais_vanta`, `profiles`
2. `types/supabase.ts` — buscar os tipos atuais de: `membros_clube`, `lotes_mais_vanta`, `solicitacoes_clube`, `tiers_mais_vanta`
3. `features/admin/services/clube/` — listar todos os arquivos para entender o que usa `lotes_mais_vanta` hoje

Só prossiga após confirmar o estado atual de cada tabela.

---

## O QUE FAZER

### Migration única: `supabase/migrations/[TIMESTAMP]_mais_vanta_fase1.sql`

Use o timestamp atual no formato `YYYYMMDDHHMMSS`.

A migration deve executar na seguinte ordem:

---

### BLOCO 1 — Tier DESCONTO

Adicionar `'desconto'` como novo valor válido nos constraints de tier em todas as tabelas que usam esse enum.

**Verificar e atualizar:**
- `membros_clube.tier` — adicionar `'desconto'` ao CHECK
- `lotes_mais_vanta.tier_id` ou campo equivalente — se tiver constraint de tier, atualizar
- `solicitacoes_clube` — se tiver campo de tier, atualizar
- `tiers_mais_vanta` — inserir novo registro para o tier DESCONTO com ordem 0

Para o registro em `tiers_mais_vanta`, usar:
```sql
-- Verificar a estrutura atual da tabela antes de inserir
-- Inserir tier DESCONTO com ordem/prioridade 0 (abaixo de todos os outros)
```

---

### BLOCO 2 — Campos novos em `membros_clube`

```sql
ALTER TABLE membros_clube
  ADD COLUMN IF NOT EXISTS nota_interna TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN membros_clube.nota_interna IS 'Nota interna da curadoria — nunca visível ao membro';
COMMENT ON COLUMN membros_clube.tags IS 'Tags internas de curadoria — nunca visíveis ao membro';
```

---

### BLOCO 3 — Campos novos em `solicitacoes_clube`

```sql
ALTER TABLE solicitacoes_clube
  ADD COLUMN IF NOT EXISTS profissao TEXT,
  ADD COLUMN IF NOT EXISTS como_conheceu TEXT;

COMMENT ON COLUMN solicitacoes_clube.profissao IS 'Profissão declarada pelo candidato no formulário de solicitação';
COMMENT ON COLUMN solicitacoes_clube.como_conheceu IS 'Como o candidato conheceu o VANTA — declarado no formulário';
```

---

### BLOCO 4 — Migrar tags de `profiles` para `membros_clube`

**Primeiro:** verificar se `profiles.tags_curadoria` existe e tem dados.

```sql
-- Se existir e tiver dados: migrar para membros_clube.tags
-- Fazer o UPDATE via JOIN entre profiles e membros_clube pelo user_id
-- Só então dropar ou deprecar o campo em profiles
-- Se não existir: pular este bloco
```

Lógica de migração:
```sql
UPDATE membros_clube mc
SET tags = ARRAY[p.tags_curadoria]
FROM profiles p
WHERE mc.user_id = p.id  -- verificar o nome correto da FK
  AND p.tags_curadoria IS NOT NULL
  AND p.tags_curadoria != '';

-- Depois de confirmar migração bem-sucedida:
ALTER TABLE profiles DROP COLUMN IF EXISTS tags_curadoria;
```

> ⚠️ Verificar o nome exato da FK entre membros_clube e profiles antes de executar.

---

### BLOCO 5 — Criar tabela `mais_vanta_lotes_evento`

```sql
CREATE TABLE IF NOT EXISTS mais_vanta_lotes_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingresso', 'lista')),
  lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
  lista_id UUID REFERENCES listas_evento(id) ON DELETE SET NULL,
  desconto_percentual INT CHECK (desconto_percentual BETWEEN 0 AND 100),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Garantir que lote_id ou lista_id está preenchido conforme o tipo
  CONSTRAINT chk_tipo_ingresso CHECK (tipo != 'ingresso' OR lote_id IS NOT NULL),
  CONSTRAINT chk_tipo_lista CHECK (tipo != 'lista' OR lista_id IS NOT NULL),
  -- Desconto obrigatório para tier desconto
  CONSTRAINT chk_desconto_tier CHECK (tier != 'desconto' OR desconto_percentual IS NOT NULL)
);

-- Adicionar constraint de tier após confirmar valores válidos
-- (incluindo o novo 'desconto')

COMMENT ON TABLE mais_vanta_lotes_evento IS 'Mapeamento de benefícios MAIS VANTA por tier para cada evento. Liga tier → lote ou lista real do evento.';

CREATE INDEX IF NOT EXISTS idx_mais_vanta_lotes_evento_evento_id ON mais_vanta_lotes_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_mais_vanta_lotes_evento_tier ON mais_vanta_lotes_evento(tier);
```

---

### BLOCO 6 — Migrar dados de `lotes_mais_vanta` → `mais_vanta_lotes_evento`

**Primeiro:** verificar a estrutura atual de `lotes_mais_vanta` e quais dados existem.

```sql
-- Verificar: SELECT COUNT(*) FROM lotes_mais_vanta;
-- Se houver dados, migrar para o novo modelo
-- Se estiver vazio, pular a migração de dados
```

A migração depende da estrutura atual — adaptar conforme o que encontrar. O objetivo é preservar os dados existentes na nova estrutura antes de dropar a tabela antiga.

---

### BLOCO 7 — Dropar `lotes_mais_vanta`

**Só executar após confirmar que:**
1. Migração do Bloco 6 foi bem-sucedida (ou tabela estava vazia)
2. Nenhuma FK aponta para `lotes_mais_vanta` sem ter sido migrada

```sql
-- Verificar FKs antes de dropar:
-- SELECT * FROM information_schema.table_constraints 
-- WHERE constraint_type = 'FOREIGN KEY' 
-- AND table_name = 'lotes_mais_vanta';

DROP TABLE IF EXISTS lotes_mais_vanta;
```

---

### BLOCO 8 — RLS para `mais_vanta_lotes_evento`

```sql
ALTER TABLE mais_vanta_lotes_evento ENABLE ROW LEVEL SECURITY;

-- Leitura: membros autenticados podem ver configurações dos eventos
CREATE POLICY "mais_vanta_lotes_evento_select" ON mais_vanta_lotes_evento
  FOR SELECT TO authenticated
  USING (true);

-- Escrita: apenas admins e gerentes (seguir padrão das outras tabelas do clube)
-- Verificar como as outras tabelas do clube implementam isso e replicar o padrão
```

> ⚠️ Verificar o padrão de RLS usado em outras tabelas do clube (ex: `clubeDealsService`, `clubeMembrosService`) e replicar exatamente.

---

### BLOCO 9 — Atualizar `membros_clube.categoria` constraints

**Verificar** o CHECK atual em `membros_clube.categoria`. Hoje está como `LIFESTYLE/INFLUENCER/CREATOR/VIP`.

Atualizar para sincronizar com os tiers:

```sql
-- Verificar constraint atual antes de alterar
-- Atualizar para: DESCONTO, CONVIDADO, PRESENCA, CREATOR, VANTA_BLACK
-- Manter retrocompatibilidade se houver dados com valores antigos
```

Se houver dados com os valores antigos (`LIFESTYLE`, `INFLUENCER`, `VIP`), fazer UPDATE de mapeamento antes de alterar o constraint:

```sql
-- Mapeamento sugerido (confirmar com Dan antes de executar):
-- LIFESTYLE → CONVIDADO
-- INFLUENCER → CREATOR  
-- VIP → PRESENCA
-- (registros sem mapeamento óbvio → CONVIDADO como fallback)
```

---

## VERIFICAÇÃO FINAL

Após criar a migration, executar:

```bash
# Validar syntax da migration
npx supabase db lint

# Rodar a migration em ambiente local (se disponível)
npx supabase db reset --local

# Gerar tipos atualizados
npx supabase gen types typescript --local > types/supabase.ts
```

Verificar no `types/supabase.ts` gerado:
- [ ] `mais_vanta_lotes_evento` aparece como nova tabela
- [ ] `membros_clube` tem `nota_interna` e `tags`
- [ ] `solicitacoes_clube` tem `profissao` e `como_conheceu`
- [ ] `lotes_mais_vanta` NÃO aparece mais
- [ ] Tier `desconto` aparece nos tipos

---

## ARQUIVOS DE SERVIÇO PARA ATUALIZAR APÓS A MIGRATION

Após a migration ser validada, atualizar as referências a `lotes_mais_vanta` nos services:

1. Listar todos os arquivos em `features/admin/services/clube/` que importam ou mencionam `lotes_mais_vanta`
2. Criar ou atualizar `clubeLotesService.ts` para usar `mais_vanta_lotes_evento`
3. Verificar se `types/supabase.ts` já foi regenerado — os tipos novos devem guiar as correções

> Não criar nenhuma UI nesta fase. Apenas banco e serviços.

---

## COMMIT

Após tudo validado:

```bash
git add supabase/migrations/ types/supabase.ts features/admin/services/clube/
git commit -m "feat(mais-vanta): fase 1 — reestruturação banco dados

- Adiciona tier DESCONTO (ordem 0) em todos os constraints
- Cria tabela mais_vanta_lotes_evento (substitui lotes_mais_vanta)
- Migra dados de lotes_mais_vanta → mais_vanta_lotes_evento
- Adiciona membros_clube.nota_interna e .tags (curadoria interna)
- Adiciona solicitacoes_clube.profissao e .como_conheceu
- Migra profiles.tags_curadoria → membros_clube.tags
- Atualiza membros_clube.categoria constraints
- Regenera types/supabase.ts"
```

---

## SE ALGO DER ERRADO

Se a migration falhar em produção, o rollback é:

```sql
-- Desfazer na ordem inversa:
-- 1. Recriar lotes_mais_vanta com estrutura original
-- 2. Remover mais_vanta_lotes_evento
-- 3. Remover campos adicionados (nota_interna, tags, profissao, como_conheceu)
-- 4. Reverter constraints de tier
-- 5. Restaurar profiles.tags_curadoria
```

> Manter o SQL de rollback no mesmo arquivo de migration como comentário no final.
