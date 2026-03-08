#!/bin/bash
# Hook: PostToolUse → Edit
# REGRA: Após cada 3 edits em arquivos do projeto, lembrar de rodar diff-check
# Usa contador temporário para rastrear edits na sessão

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar arquivos fora do projeto, memórias, configs
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/node_modules/*|*.md|*.json|*.env*)
    exit 0
    ;;
esac

# Só contar edits em código do projeto (.ts, .tsx, .css, .html)
case "$FILE_PATH" in
  *.ts|*.tsx|*.css|*.html) ;;
  *) exit 0 ;;
esac

# Contador de edits
COUNTER_FILE="/tmp/vanta_edit_counter"
DIFF_CHECK_MARKER="/tmp/vanta_diffcheck_ran"

# Incrementar contador
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi

echo "$COUNT" > "$COUNTER_FILE"

# Se diff-check rodou recentemente, resetar contador
if [ -f "$DIFF_CHECK_MARKER" ]; then
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$DIFF_CHECK_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -le 60 ]; then
    echo "1" > "$COUNTER_FILE"
    exit 0
  fi
fi

# A cada 3 edits, lembrar
if [ "$COUNT" -ge 3 ]; then
  echo "⚠️ DIFF-CHECK: $COUNT edits desde o último check. Rodar 'npm run diff-check' para validar (TSC + ESLint + layout)."
  echo "0" > "$COUNTER_FILE"
fi

exit 0
