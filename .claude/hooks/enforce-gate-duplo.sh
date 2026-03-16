#!/bin/bash
# Hook: PreToolUse → Bash
# GATE DUPLO: Bloqueia git commit se Lia e Memo não aprovaram.
# Regra: NENHUM commit sem aprovação da Lia (memórias) + Memo (ata).

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Só verificar em comandos de commit
case "$COMMAND" in
  *git\ commit*|*git\ push*) ;;
  *) exit 0 ;;
esac

BLOCKERS=""

# Lia aprovou?
if [ ! -f "/tmp/vanta_lia_approved" ]; then
  BLOCKERS="${BLOCKERS}\n🔴 LIA (Guardiã de Memória) NÃO aprovou. Convocar Lia pra verificar memórias."
fi

# Memo aprovou?
if [ ! -f "/tmp/vanta_memo_approved" ]; then
  BLOCKERS="${BLOCKERS}\n🔴 MEMO (Secretário Executivo) NÃO aprovou. Verificar se ata está completa."
fi

# Preflight passou?
if [ ! -f "/tmp/vanta_preflight_passed" ]; then
  BLOCKERS="${BLOCKERS}\n🔴 PREFLIGHT não rodado ou falhou. Rodar 'npm run preflight' antes do commit."
fi

if [ -n "$BLOCKERS" ]; then
  BLOCKERS=$(echo "$BLOCKERS" | sed 's/^\\n//')
  jq -n --arg blockers "$BLOCKERS" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("BLOQUEADO — GATE DUPLO NÃO PASSOU\n\n" + $blockers + "\n\nFluxo obrigatório:\n1. Rodar npm run preflight (deve passar 8/8)\n2. Convocar Lia → verificar memórias → touch /tmp/vanta_lia_approved\n3. Convocar Memo → verificar ata completa → touch /tmp/vanta_memo_approved\n4. SÓ ENTÃO commit permitido")
    }
  }'
  exit 0
fi

exit 0
