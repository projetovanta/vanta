#!/bin/bash
# Hook: PostToolUse → Read, Grep
# Quando uma memória de módulo é lida, cria marker em /tmp para liberar edits nesse módulo.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Read" ] && [ "$TOOL_NAME" != "Grep" ]; then
  exit 0
fi

# Extrair file_path (Read) ou path (Grep)
if [ "$TOOL_NAME" = "Read" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.path // empty')
fi

# Checar se é um arquivo de memória de módulo
case "$FILE_PATH" in
  */memory/modulo_*|*/memory/sub_*)
    # Extrair nome do módulo (ex: modulo_clube, sub_portaria_caixa)
    BASENAME=$(basename "$FILE_PATH" .md)
    touch "/tmp/vanta_memory_read_${BASENAME}"
    ;;
esac

exit 0
