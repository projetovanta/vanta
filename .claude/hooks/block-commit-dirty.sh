#!/bin/bash
# Hook: PreToolUse → Bash
# REGRA: Bloquear git commit se npm run preflight não rodou na sessão
# Detecta: qualquer comando bash que contenha 'git commit'

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Só checar comandos git commit
if ! echo "$COMMAND" | grep -qE 'git\s+commit'; then
  exit 0
fi

# Checar se preflight rodou (marcador temporário)
PREFLIGHT_MARKER="/tmp/vanta_preflight_passed"
if [ -f "$PREFLIGHT_MARKER" ]; then
  # Checar se o marker tem menos de 30 min
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$PREFLIGHT_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -le 1800 ]; then
    exit 0
  fi
fi

jq -n '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: "BLOQUEADO: git commit sem preflight.\nREGRA: rodar npm run preflight ANTES de commitar.\nSe preflight passou, rodar: touch /tmp/vanta_preflight_passed\nDepois tentar o commit novamente."
  }
}'
exit 0
