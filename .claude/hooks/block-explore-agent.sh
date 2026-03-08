#!/bin/bash
# Hook: PreToolUse → Agent
# REGRA ABSOLUTA: NUNCA lançar agentes para ler/buscar código do projeto.
# Bloqueia: Explore agents (qualquer), e qualquer Agent cujo prompt indica leitura de código.
# Permitidos: Agent para tarefas que NÃO envolvem leitura de código (ex: claude-code-guide, statusline).

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Agent" ]; then
  exit 0
fi

AGENT_TYPE=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // empty')
PROMPT=$(echo "$INPUT" | jq -r '.tool_input.prompt // empty' | tr '[:upper:]' '[:lower:]')
DESCRIPTION=$(echo "$INPUT" | jq -r '.tool_input.description // empty' | tr '[:upper:]' '[:lower:]')

# BLOQUEAR: Explore agents — SEMPRE
if [ "$AGENT_TYPE" = "Explore" ]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "BLOQUEADO: Explore Agent PROIBIDO.\nUsar:\n• npm run explore -- <path>\n• npm run deps -- <arquivo>\n• npm run props -- <Component>\n• npm run store-map -- <store>\n• Grep/Read cirúrgico\nNUNCA lançar agentes para ler código."
    }
  }'
  exit 0
fi

# BLOQUEAR: qualquer Agent cujo prompt/description indique leitura/busca de CÓDIGO DO PROJETO
# NÃO bloquear: buscas web, tarefas genéricas, agentes utilitários
COMBINED="$PROMPT $DESCRIPTION"
BLOCK_PATTERNS="search.*code|find.*file|read.*file|look.*for.*in.*code|grep.*code|explore.*code|buscar.*código|ler.*arquivo|procurar.*arquivo|search.*symbol|find.*symbol|search.*codebase|find.*function|search.*component|investigar.*estado|investig.*codebase"

# Padrões que PERMITEM (buscas web, tarefas não-código)
ALLOW_PATTERNS="web.*search|websearch|webfetch|fetch.*url|search.*internet|buscar.*na.*web|buscar.*online|google|stackoverflow"

# Se contém padrão de permissão, liberar
if echo "$COMBINED" | grep -qiE "$ALLOW_PATTERNS"; then
  exit 0
fi

if echo "$COMBINED" | grep -qiE "$BLOCK_PATTERNS"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "BLOQUEADO: Agent para ler/buscar código PROIBIDO.\nUsar:\n• npm run explore -- <path>\n• npm run deps -- <arquivo>\n• npm run props -- <Component>\n• npm run store-map -- <store>\n• Grep → busca textual\n• Read com offset+limit → leitura cirúrgica\nNUNCA delegar leitura de código a agentes."
    }
  }'
  exit 0
fi

# Permitir agentes para tarefas não-código
exit 0
