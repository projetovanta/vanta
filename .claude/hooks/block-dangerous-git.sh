#!/bin/bash
# Hook: PreToolUse → Bash
# REGRA: Bloquear comandos git destrutivos
# push --force, reset --hard, checkout ., clean -f, branch -D

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Padrões perigosos
DANGEROUS=""

if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  DANGEROUS="git push --force — pode sobrescrever trabalho remoto"
elif echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  DANGEROUS="git reset --hard — descarta todas as mudanças locais irreversivelmente"
elif echo "$COMMAND" | grep -qE 'git\s+checkout\s+\.'; then
  DANGEROUS="git checkout . — descarta todas as mudanças não commitadas"
elif echo "$COMMAND" | grep -qE 'git\s+clean\s+-f'; then
  DANGEROUS="git clean -f — deleta arquivos não rastreados irreversivelmente"
elif echo "$COMMAND" | grep -qE 'git\s+branch\s+-D'; then
  DANGEROUS="git branch -D — deleta branch sem verificar merge"
elif echo "$COMMAND" | grep -qE 'git\s+restore\s+\.'; then
  DANGEROUS="git restore . — descarta todas as mudanças não commitadas"
fi

if [ -n "$DANGEROUS" ]; then
  jq -n --arg reason "$DANGEROUS" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("BLOQUEADO: comando git destrutivo detectado.\n" + $reason + "\nPedir confirmação EXPLÍCITA do usuário antes de executar.\nSe o usuário já autorizou, usar AskUserQuestion para confirmar.")
    }
  }'
  exit 0
fi

exit 0
