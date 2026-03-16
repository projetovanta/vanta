---
name: Aplicar migrations imediatamente
description: NUNCA deixar migration pendente — aplicar no Supabase assim que criar, gerar tipos e testar antes de reportar como pronto.
type: feedback
---

Aplicar migration + gerar tipos + deploy Edge Functions = parte OBRIGATÓRIA da entrega. Não é "próximo passo".

**Why:** O Dan tem acesso ao Supabase via MCP e espera que o trabalho seja entregue funcionando. Deixar migration pendente e usar `as any` como workaround é incompleto.

**How to apply:** Sempre que criar uma migration:
1. Aplicar com `apply_migration` via MCP Supabase
2. Gerar tipos com `generate_typescript_types`
3. Substituir workarounds (`as any`) pelos tipos reais
4. Deploy Edge Functions relacionadas
5. Só ENTÃO reportar como pronto
