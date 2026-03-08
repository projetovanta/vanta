#!/bin/bash
# Hook: PreToolUse → Edit
# REGRA: Bloquear edits que contenham 'new Date().toISOString()' em arquivos .ts/.tsx
# Motivo: timestamps pro Supabase DEVEM usar formato -03:00

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Para Edit checa new_string, para Write checa content
if [ "$TOOL_NAME" = "Edit" ]; then
  NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
else
  NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
fi

# Só checar arquivos .ts/.tsx do projeto
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Ignorar arquivos de memória, config, scripts
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/scripts/*|*/node_modules/*|*.md|*.json)
    exit 0
    ;;
esac

# Checar se new_string contém o padrão proibido
if echo "$NEW_STRING" | grep -q 'new Date()\.toISOString()'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "BLOQUEADO: new Date().toISOString() detectado.\nREGRA: timestamps pro Supabase DEVEM usar formato -03:00.\nUsar: new Date().toLocaleString(\"sv-SE\", { timeZone: \"America/Sao_Paulo\" }).replace(\" \", \"T\") + \"-03:00\"\nOu usar a helper nowBRT() se existir."
    }
  }'
  exit 0
fi

exit 0
