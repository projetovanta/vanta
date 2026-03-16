---
name: ZERO workarounds com as any no Supabase
description: NUNCA usar 'as any' ou workarounds para contornar tipos — aplicar migration primeiro, gerar tipos, depois codificar.
type: feedback
---

TERMINANTEMENTE PROIBIDO criar workarounds como `db = supabase as any` ou qualquer cast pra contornar tipos inexistentes.

**Why:** O Dan tem acesso ao Supabase via MCP. A migration DEVE ser aplicada e os tipos gerados ANTES de escrever o service que usa a tabela nova. A ordem correta é:
1. Criar migration local
2. Aplicar no Supabase (`apply_migration`)
3. Gerar tipos (`generate_typescript_types`)
4. Salvar em `types/supabase.ts`
5. SÓ ENTÃO escrever o service/componente que usa a tabela

**How to apply:** NUNCA codificar service que referencia tabela nova sem antes ter a tabela no banco e nos tipos. Se o TypeScript reclama que a tabela não existe, é porque você pulou etapas — volte e aplique a migration primeiro.
