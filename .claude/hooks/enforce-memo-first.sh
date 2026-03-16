#!/bin/bash
# Hook: PreToolUse → Edit, Write, AskUserQuestion, Bash
# REGRA: Memo (Secretário Executivo) DEVE ser ativado ANTES de qualquer trabalho.
# Se a ata do dia não existe ou não foi atualizada nesta sessão → BLOQUEAR.
# Marker: /tmp/vanta_memo_ativado (criado quando Memo é ativado)

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Só aplicar em ações de trabalho real
case "$TOOL_NAME" in
  Edit|Write|AskUserQuestion) ;;
  *) exit 0 ;;
esac

# Ignorar edições em memória, hooks, atas, config (Memo precisa poder escrever a ata)
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  case "$FILE_PATH" in
    */memory/*|*/.claude/*|*/.agents/*|*/scripts/*|*.json|*.sh|*.md)
      exit 0
      ;;
  esac
fi

# Verificar se Memo foi ativado nesta sessão
MEMO_MARKER="/tmp/vanta_memo_ativado"
if [ -f "$MEMO_MARKER" ]; then
  # Checar se tem menos de 4h (sessão ativa)
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$MEMO_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -le 14400 ]; then
    exit 0
  fi
fi

jq -n '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: "BLOQUEADO: Memo (Secretário Executivo) NÃO foi ativado nesta sessão.\nREGRA: Memo DEVE ser o PRIMEIRO em toda sessão de trabalho.\n\nO QUE FAZER AGORA:\n1. Ler .claude/agents/memo.md\n2. Ler .agents/REGRAS-DA-EMPRESA.md\n3. Verificar/criar ata do dia em memory/atas/YYYY-MM-DD.md\n4. Registrar participantes e resumo\n5. Marcar como ativado: touch /tmp/vanta_memo_ativado\n\nSó depois o trabalho pode começar."
  }
}'
exit 0
