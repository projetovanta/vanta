---
name: NUNCA contornar hooks via Bash/node/python/sed
description: Se um hook bloqueou uma ação, NUNCA usar Bash com node -e, python -c, sed -i ou qualquer outro comando pra contornar. Pedir autorização ao Dan via AskUserQuestion.
type: feedback
---

NUNCA contornar um hook de proteção usando comandos Bash alternativos.
NUNCA usar `touch` pra criar markers — markers precisam de conteúdo verificável.

**Why:** Em 16/03/2026, Rafa contornou hook de proteção usando `node -e` com `fs.writeFileSync` via Bash. Dan flagrou. Depois, auditoria revelou que todos os markers /tmp podiam ser criados com `touch` sem conteúdo — invalidando todos os gates.

**How to apply:**
- Se um hook BLOQUEOU → a ação está bloqueada. Ponto.
- NUNCA tentar via `node -e`, `python -c`, `sed -i`, `echo >`, `cat >`, etc.
- NUNCA `touch /tmp/vanta_*` — markers sem conteúdo são REJEITADOS pelos hooks
- Fluxo pra arquivo protegido:
  1. Hook bloqueia
  2. AskUserQuestion: "Autoriza editar [arquivo]?"
  3. Se Dan autorizar: `scripts/vanta-marker.sh dan_authorized`
  4. Tentar novamente
- Fluxo pra markers de sessão:
  1. Fazer a ação real (ler feedbacks, ativar Memo, consultar equipe)
  2. Rodar `scripts/vanta-marker.sh <tipo>` (gera marker com hash/timestamp)
  3. Hook valida conteúdo do marker antes de liberar
