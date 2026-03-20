---
name: Supabase Project ID correto
description: O project_id do Supabase MCP é daldttuibmxwkpbqtebm (não jbmqjbatpqbxajkndixx que é referência antiga)
type: feedback
---

O project_id correto para o MCP do Supabase é `daldttuibmxwkpbqtebm` (projeto "finalvanta", região sa-east-1).

**Why:** O ID `jbmqjbatpqbxajkndixx` aparece em referências antigas mas dá erro de permissão no MCP. O correto é descoberto via `list_projects`.

**How to apply:** Sempre usar `daldttuibmxwkpbqtebm` em chamadas MCP Supabase (apply_migration, execute_sql, etc.). Se der erro de permissão, primeiro verificar o project_id via `list_projects`.
