# LOG DE DECISÕES — Template
# Cada agente DEVE usar este formato ANTES de executar qualquer ação.
# O log fica na ata do dia (memory/atas/YYYY-MM-DD.md).
#
# REGRA: Se "Autorização do Dan" = PENDENTE → NÃO executar.

---

## Como Usar

Antes de qualquer ação significativa (criar arquivo, editar código, rodar comando, etc),
o agente DEVE registrar a decisão usando o formato abaixo.

Copie o template, preencha, e inclua na ata do dia.

---

## Template de Decisão

```markdown
### Decisão — [TIMESTAMP]

| Campo | Valor |
|-------|-------|
| **Agente** | [nome do agente] |
| **Sessão** | [data da ata] |
| **Contexto** | [o que o Dan pediu — citação direta] |
| **Ação proposta** | [o que pretendo fazer — específico] |
| **Arquivos afetados** | [lista de arquivos que serão criados/editados/deletados] |
| **Justificativa** | [por que esta ação resolve o pedido] |
| **Risco** | 🟢/🟡/🔴 |
| **Reversível** | SIM/NÃO |
| **Autorização do Dan** | ✅ SIM / ❌ NÃO / ⏳ PENDENTE |
| **Status** | AGUARDANDO / APROVADO / REJEITADO / EXECUTADO |

**Notas:** [qualquer observação adicional]
```

---

## Exemplos

### Decisão — 2026-03-16 14:30

| Campo | Valor |
|-------|-------|
| **Agente** | Luna (Frontend) |
| **Sessão** | 2026-03-16 |
| **Contexto** | Dan: "arruma o botão de login que tá quebrando" |
| **Ação proposta** | Editar src/components/LoginButton.tsx — corrigir handler onClick |
| **Arquivos afetados** | src/components/LoginButton.tsx |
| **Justificativa** | O handler estava referenciando estado undefined |
| **Risco** | 🟢 |
| **Reversível** | SIM (git revert) |
| **Autorização do Dan** | ⏳ PENDENTE |
| **Status** | AGUARDANDO |

---

### Decisão — 2026-03-16 15:00

| Campo | Valor |
|-------|-------|
| **Agente** | Kai (Supabase) |
| **Sessão** | 2026-03-16 |
| **Contexto** | Dan: "adiciona campo de telefone na tabela profiles" |
| **Ação proposta** | Criar migration: ALTER TABLE profiles ADD COLUMN phone TEXT |
| **Arquivos afetados** | supabase/migrations/XXXX_add_phone.sql |
| **Justificativa** | Campo necessário para feature de verificação por SMS |
| **Risco** | 🟡 (migration em produção — testar local antes) |
| **Reversível** | SIM (migration de rollback) |
| **Autorização do Dan** | ⏳ PENDENTE |
| **Status** | AGUARDANDO |

---

## Regras do Log

1. **TODA ação significativa precisa de log** — não existe "ação pequena demais"
2. **PENDENTE = NÃO EXECUTAR** — só executar com ✅ SIM
3. **Logs ficam na ata** — Memo organiza e arquiva
4. **Logs são permanentes** — nunca apagar, mesmo que rejeitados
5. **Um log por ação** — não agrupar múltiplas ações num log só
6. **Ser específico** — "editar arquivo X" não serve. Dizer O QUE vai editar.
