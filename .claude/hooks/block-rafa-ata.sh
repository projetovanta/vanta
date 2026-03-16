#!/bin/bash
# Hook: PreToolUse → Edit, Write
# BLOQUEIA Rafa de criar ou atualizar atas.
# Atas são responsabilidade EXCLUSIVA do Memo (secretário executivo).
# Rafa pode LER atas, mas NUNCA escrever/editar.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Checar se é arquivo de ata
case "$FILE_PATH" in
  */atas/*|*/ata_*|*ATA_*|*ata-*)
    jq -n '{
      decision: "block",
      reason: "🚫 BLOQUEADO — Rafa NÃO escreve atas.\n\nRegra: Atas são trabalho EXCLUSIVO do Memo (secretário executivo).\n\nDelegue:\n→ Chame o Memo: /memo\n→ Memo cria e mantém as atas\n→ Rafa pode LER atas, mas NUNCA editar\n\nSe precisa registrar algo → peça ao Memo."
    }'
    exit 0
    ;;
esac

exit 0
