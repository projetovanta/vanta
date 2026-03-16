#!/bin/bash
# Hook: PostToolUse → Bash
# Rastreia se o último diff-check/preflight passou ou falhou.
# Cria/remove markers que outros hooks usam pra bloquear.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
STDOUT=$(echo "$INPUT" | jq -r '.stdout // empty')

# Detectar diff-check ou preflight
case "$COMMAND" in
  *diff-check*|*preflight*)
    if echo "$STDOUT" | grep -q "FALHOU\|FAILED\|error"; then
      touch /tmp/vanta_diffcheck_failed
      rm -f /tmp/vanta_diffcheck_last 2>/dev/null
      jq -n '{
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: "🔴 DIFF-CHECK/PREFLIGHT FALHOU — Corrigir TODOS os erros antes de continuar. Dan disse: ZERO erros tolerados."
        }
      }'
    else
      rm -f /tmp/vanta_diffcheck_failed 2>/dev/null
      NOW_TS=$(date +%s)
      echo "VANTA_MARKER|diffcheck_ran|${NOW_TS}|passed" > /tmp/vanta_diffcheck_ran
      echo "VANTA_MARKER|diffcheck_last|${NOW_TS}|passed" > /tmp/vanta_diffcheck_last
      # Reset edit counters
      rm -f /tmp/vanta_edit_count 2>/dev/null
      rm -f /tmp/vanta_edit_count_unified 2>/dev/null
    fi
    ;;
esac

exit 0
