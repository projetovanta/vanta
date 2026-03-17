#!/bin/bash
# Hook: PostToolUse → Edit, Write
# CONSOLIDADO de: memory-check.sh + memory-sync-check.sh
#
# Apos editar codigo do projeto:
# 1. Busca quais memorias referenciam o arquivo editado
# 2. Verifica se funcoes/exports mencionados nas memorias ainda existem
# 3. Emite 1 aviso consolidado

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Ignorar memorias, configs, node_modules
case "$FILE_PATH" in
  */memory/*|*/node_modules/*|*/.claude/*|*/.agents/*|*/scripts/*|*.md|*.json|*.env*|*.sh)
    exit 0
    ;;
esac

# So codigo
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

FILENAME=$(basename "$FILE_PATH")

# Diretorios de memoria
MEM_DIRS=(
  "$PROJECT_DIR/memory"
  "$HOME/.claude/projects/-Users-vanta-prevanta/memory"
)

REFS=""
STALE=""

for MEM_DIR in "${MEM_DIRS[@]}"; do
  [ -d "$MEM_DIR" ] || continue

  for mem in "$MEM_DIR"/*.md; do
    [ -f "$mem" ] || continue
    MEMNAME=$(basename "$mem")

    # 1. Buscar memorias que referenciam este arquivo
    if grep -q "$FILENAME" "$mem" 2>/dev/null; then
      REFS="${REFS} ${MEMNAME}"

      # 2. Verificar funcoes/exports mencionados na memoria
      MENTIONED=$(grep -oE '\b(function|const|class|export)\s+\w+' "$mem" 2>/dev/null | awk '{print $2}' | sort -u | head -20)

      if [ -n "$MENTIONED" ]; then
        MISSING=""
        for func in $MENTIONED; do
          if ! grep -q "\b${func}\b" "$FILE_PATH" 2>/dev/null; then
            MISSING="${MISSING} ${func}"
          fi
        done

        if [ -n "$MISSING" ]; then
          STALE="${STALE}\n  ${MEMNAME}: funcoes removidas:${MISSING}"
        fi
      fi
    fi
  done
done

# Emitir aviso consolidado
OUTPUT=""

if [ -n "$REFS" ]; then
  OUTPUT="MEMORIA: '${FILENAME}' referenciado por:${REFS}. Verificar se precisam de atualizacao."
fi

if [ -n "$STALE" ]; then
  OUTPUT="${OUTPUT}\nDESSINC:${STALE}\nACAO: Atualizar memorias ANTES de entregar."
fi

if [ -n "$OUTPUT" ]; then
  echo "$OUTPUT"
fi

exit 0
