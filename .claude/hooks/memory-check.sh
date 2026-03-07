#!/bin/bash
# Hook: PostToolUse → Edit, Write
# Após cada edição de arquivo do projeto, verifica se alguma memória referencia esse arquivo.
# Se sim, emite aviso para verificar/atualizar a memória.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Só checa Edit e Write
if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Se não tem file_path, ignora
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Ignorar arquivos fora do projeto
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$FILE_PATH" in
  "$PROJECT_DIR"/*) ;;
  *) exit 0 ;;
esac

# Ignorar memórias, configs, node_modules
case "$FILE_PATH" in
  */memory/*|*/node_modules/*|*/.claude/*|*.md|*.json|*.env*|*/CLAUDE.md)
    exit 0
    ;;
esac

# Extrair nome do arquivo
FILENAME=$(basename "$FILE_PATH")

# Diretório de memórias
MEMORY_DIR="$HOME/.claude/projects/-Users-vanta-Documents-prevanta/memory"

if [ ! -d "$MEMORY_DIR" ]; then
  exit 0
fi

# Buscar em todas as memórias se alguma referencia este arquivo
MATCHES=""
for mem in "$MEMORY_DIR"/*.md; do
  if grep -q "$FILENAME" "$mem" 2>/dev/null; then
    MEMNAME=$(basename "$mem")
    MATCHES="${MATCHES}${MEMNAME}, "
  fi
done

# Se encontrou referências, emitir aviso
if [ -n "$MATCHES" ]; then
  # Remove trailing ", "
  MATCHES="${MATCHES%, }"
  echo "⚠️ MEMÓRIA: O arquivo '$FILENAME' é referenciado por: $MATCHES. Verificar se as memórias precisam de atualização antes de entregar."
fi

exit 0
