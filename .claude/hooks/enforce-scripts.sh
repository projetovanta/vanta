#!/bin/bash
# Hook: PreToolUse → Read
# REGRA: Nunca ler arquivo inteiro do projeto sem usar offset+limit.
# Deve usar: npm run explore, npm run deps, npm run props, npm run store-map, Grep, ou Read com offset+limit.
# Exceção: arquivos fora do projeto, CLAUDE.md, memory/, package.json, configs, e arquivos pequenos (<80 linhas).

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Só checa Read
if [ "$TOOL_NAME" != "Read" ]; then
  exit 0
fi

# Se não tem file_path, permite
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Se arquivo não existe, permite (Read vai retornar erro naturalmente)
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Exceções — sempre permitir ler inteiro:
# - CLAUDE.md, memory/, package.json, configs, .md, .json, .env, settings
case "$FILE_PATH" in
  */CLAUDE.md|*/memory/*|*/package.json|*/tsconfig.json|*/vite.config.ts|*.md|*.json|*.env*|*/.claude/*|*/node_modules/*|*/scripts/*.mjs|*/scripts/*.sh)
    exit 0
    ;;
esac

# Se já tem limit definido, permite (leitura cirúrgica)
REQUESTED_LIMIT=$(echo "$INPUT" | jq -r '.tool_input.limit // empty')
if [ -n "$REQUESTED_LIMIT" ]; then
  exit 0
fi

# Se arquivo tem menos de 80 linhas, permite ler inteiro
LINE_COUNT=$(wc -l < "$FILE_PATH" 2>/dev/null | tr -d ' ')
if [ -z "$LINE_COUNT" ] || [ "$LINE_COUNT" -le 80 ]; then
  exit 0
fi

# BLOQUEAR — arquivo do projeto com mais de 80 linhas sem limit
jq -n \
  --argjson lines "$LINE_COUNT" \
  --arg path "$FILE_PATH" \
  '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("BLOQUEADO: \($path) tem \($lines) linhas. REGRA: usar scripts primeiro!\n• npm run explore -- <path> → entender módulo\n• npm run deps -- <arquivo> → ver dependentes\n• npm run props -- <Component> → ver interfaces\n• npm run store-map -- <store> → ver estado\n• Grep → achar linha exata\n• Read com offset+limit → leitura cirúrgica\nNUNCA ler arquivo inteiro do projeto.")
    }
  }'
exit 0
