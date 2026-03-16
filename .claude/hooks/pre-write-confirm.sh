#!/bin/bash
# Hook: PreToolUse → Write/Edit
# Protege arquivos críticos contra escrita não autorizada
# Bloqueia: regras, protocolos, configs, .env

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED=""

# Regras e protocolos
if echo "$FILE_PATH" | grep -qi "REGRAS-GLOBAIS.md"; then
  PROTECTED="REGRAS-GLOBAIS.md — regras absolutas da empresa"
elif echo "$FILE_PATH" | grep -qi "PROTOCOLO-ANTI-ALUCINACAO.md"; then
  PROTECTED="PROTOCOLO-ANTI-ALUCINACAO.md — protocolo de segurança"
elif echo "$FILE_PATH" | grep -qi "PROTOCOLO-ERRO.md"; then
  PROTECTED="PROTOCOLO-ERRO.md — protocolo de erros"
elif echo "$FILE_PATH" | grep -qi "PERFIL-DAN.md"; then
  PROTECTED="PERFIL-DAN.md — perfil do CEO"
elif echo "$FILE_PATH" | grep -qi "VANTA-EMPRESA.md"; then
  PROTECTED="VANTA-EMPRESA.md — briefing da empresa"

# Configs críticas
elif echo "$FILE_PATH" | grep -qi "\.env"; then
  PROTECTED=".env — variáveis de ambiente (secrets)"
elif echo "$FILE_PATH" | grep -qi "settings\.json"; then
  PROTECTED="settings.json — configuração do Claude Code"
fi

if [ -n "$PROTECTED" ]; then
  jq -n --arg reason "$PROTECTED" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("PROTEGIDO: " + $reason + "\nModificações precisam de autorização EXPLÍCITA do Dan.")
    }
  }'
  exit 0
fi

exit 0
