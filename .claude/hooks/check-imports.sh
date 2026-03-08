#!/bin/bash
# Hook: PostToolUse → Edit
# Após editar arquivo .ts/.tsx, verifica imports não utilizados com uma checagem rápida.
# Não bloqueia — apenas avisa.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Só checar .ts/.tsx do projeto
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/node_modules/*|*/scripts/*)
    exit 0
    ;;
esac

# Se arquivo não existe, ignorar
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Checar imports não utilizados de forma simples:
# Extrair nomes importados e verificar se aparecem no resto do arquivo
UNUSED=""
while IFS= read -r line; do
  # Extrair nomes entre { } dos imports
  NAMES=$(echo "$line" | sed -n 's/.*{\([^}]*\)}.*/\1/p' | tr ',' '\n' | sed 's/^ *//;s/ *$//' | sed 's/ as .*//')
  for name in $NAMES; do
    if [ -z "$name" ] || [ "$name" = "type" ]; then continue; fi
    # Contar ocorrências no arquivo (excluindo a linha de import)
    COUNT=$(grep -c "\b${name}\b" "$FILE_PATH" 2>/dev/null || echo 0)
    if [ "$COUNT" -le 1 ]; then
      UNUSED="${UNUSED} ${name}"
    fi
  done
done < <(grep "^import " "$FILE_PATH" 2>/dev/null)

if [ -n "$UNUSED" ]; then
  echo "⚠️ IMPORTS: Possíveis imports não utilizados em $(basename "$FILE_PATH"):${UNUSED}. Verificar antes de entregar."
fi

exit 0
