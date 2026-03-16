#!/bin/bash
# Hook: PostToolUse → AskUserQuestion
# REGRA: Após cada decisão do Dan (via AskUserQuestion), verificar se a ata do dia
# foi atualizada com a decisão. Se não → AVISAR pra registrar.
# Marker: /tmp/vanta_ata_ultima_atualizacao (timestamp da última edição da ata)

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Só após AskUserQuestion (= decisão do Dan)
if [ "$TOOL_NAME" != "AskUserQuestion" ]; then
  exit 0
fi

# Verificar se ata do dia existe
TODAY=$(date +%Y-%m-%d)
ATA_FILE="$CLAUDE_PROJECT_DIR/memory/atas/${TODAY}.md"

if [ ! -f "$ATA_FILE" ]; then
  jq -n --arg today "$TODAY" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: ("⚠️ MEMO ALERTA: Ata do dia " + $today + " NÃO EXISTE. Criar AGORA em memory/atas/" + $today + ".md com a decisão que acabou de ser tomada.")
    }
  }'
  exit 0
fi

# Verificar se a ata foi atualizada recentemente (últimos 10 min)
ATA_MOD=$(stat -f "%m" "$ATA_FILE" 2>/dev/null || echo 0)
NOW_TS=$(date +%s)
DIFF=$((NOW_TS - ATA_MOD))

# Se a ata não foi editada nos últimos 10 min, avisar
if [ "$DIFF" -gt 600 ]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: "⚠️ MEMO ALERTA: Uma decisão foi tomada mas a ata do dia NÃO foi atualizada nos últimos 10 minutos. Registrar a decisão do Dan na ata AGORA."
    }
  }'
fi

exit 0
