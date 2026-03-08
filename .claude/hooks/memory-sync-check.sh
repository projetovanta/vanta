#!/bin/bash
# Hook: PostToolUse → Edit, Write
# Após editar código, verifica se as memórias que referenciam o arquivo editado
# ainda são consistentes com o código real.
# Checa: funções mencionadas na memória ainda existem? Arquivos mencionados existem?

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar não-código
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/node_modules/*|*.md|*.json|*.env*|*/scripts/*)
    exit 0
    ;;
esac

case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

FILENAME=$(basename "$FILE_PATH")
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Diretórios de memória
MEM_DIRS=(
  "$PROJECT_DIR/memory"
  "$HOME/.claude/projects/-Users-vanta-Documents-prevanta/memory"
)

STALE_MEMS=""

for MEM_DIR in "${MEM_DIRS[@]}"; do
  if [ ! -d "$MEM_DIR" ]; then continue; fi

  for mem in "$MEM_DIR"/*.md; do
    [ -f "$mem" ] || continue
    MEMNAME=$(basename "$mem")

    # Se a memória referencia o arquivo editado
    if grep -q "$FILENAME" "$mem" 2>/dev/null; then
      # Extrair funções/exports mencionados na memória para este arquivo
      # Formato esperado: [function] nome ou funcao: nome
      MENTIONED=$(grep -oE '\b(function|const|class|export)\s+\w+' "$mem" 2>/dev/null | awk '{print $2}' | sort -u | head -20)

      if [ -n "$MENTIONED" ]; then
        MISSING=""
        for func in $MENTIONED; do
          # Verificar se a função/export ainda existe no arquivo editado
          if ! grep -q "\b${func}\b" "$FILE_PATH" 2>/dev/null; then
            MISSING="${MISSING} ${func}"
          fi
        done

        if [ -n "$MISSING" ]; then
          STALE_MEMS="${STALE_MEMS}
⚠️ DESSINC: ${MEMNAME} menciona funções/exports que NÃO existem mais em ${FILENAME}:${MISSING}"
        fi
      fi
    fi
  done
done

if [ -n "$STALE_MEMS" ]; then
  echo "$STALE_MEMS"
  echo "🔴 AÇÃO: Atualizar memórias ANTES de entregar. Memória desatualizada = bug futuro."
fi

exit 0
