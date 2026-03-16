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
    # Checar se Dan autorizou explicitamente (ex: Memo ativo como persona)
    AUTH_MARKER="/tmp/vanta_dan_authorized_edit"
    if [ -f "$AUTH_MARKER" ]; then
      AUTH_CONTENT=$(cat "$AUTH_MARKER" 2>/dev/null)
      if echo "$AUTH_CONTENT" | grep -q "^VANTA_MARKER|dan_authorized|"; then
        AUTH_TS=$(echo "$AUTH_CONTENT" | cut -d'|' -f3)
        NOW_TS=$(date +%s)
        if [ $((NOW_TS - AUTH_TS)) -le 300 ]; then
          rm -f "$AUTH_MARKER"
          exit 0
        fi
      fi
    fi
    jq -n '{
      decision: "block",
      reason: "BLOQUEADO — Rafa NAO escreve atas.\n\nRegra: Atas sao trabalho EXCLUSIVO do Memo.\n\nSe Dan autorizou: scripts/vanta-marker.sh dan_authorized\nSenao: chame o Memo /memo"
    }'
    exit 0
    ;;
esac

exit 0
