#!/bin/bash
# Hook: PreToolUse → Write/Edit
# Protege arquivos criticos contra escrita nao autorizada.
# Bloqueia: regras, protocolos, configs, .env, CLAUDE.md, REGRAS-DA-EMPRESA.md
# Marker de autorizacao: conteudo verificavel (VANTA_MARKER), one-shot, TTL 5min.

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
  PROTECTED="PROTOCOLO-ANTI-ALUCINACAO.md — protocolo de seguranca"
elif echo "$FILE_PATH" | grep -qi "PROTOCOLO-ERRO.md"; then
  PROTECTED="PROTOCOLO-ERRO.md — protocolo de erros"
elif echo "$FILE_PATH" | grep -qi "PERFIL-DAN.md"; then
  PROTECTED="PERFIL-DAN.md — perfil do CEO"
elif echo "$FILE_PATH" | grep -qi "VANTA-EMPRESA.md"; then
  PROTECTED="VANTA-EMPRESA.md — briefing da empresa"
elif echo "$FILE_PATH" | grep -qi "REGRAS-DA-EMPRESA.md"; then
  PROTECTED="REGRAS-DA-EMPRESA.md — regras obrigatorias de todos os agentes"
elif echo "$FILE_PATH" | grep -qi "MEMORIA-COMPARTILHADA.md"; then
  PROTECTED="MEMORIA-COMPARTILHADA.md — indice compartilhado da equipe"

# CLAUDE.md — arquivo mais critico do projeto
elif echo "$FILE_PATH" | grep -q "CLAUDE.md$"; then
  PROTECTED="CLAUDE.md — regras do projeto, checklist, fluxos obrigatorios"

# Configs criticas
elif echo "$FILE_PATH" | grep -qi "\.env"; then
  PROTECTED=".env — variaveis de ambiente (secrets)"
elif echo "$FILE_PATH" | grep -qi "settings\.json"; then
  PROTECTED="settings.json — configuracao do Claude Code"
fi

if [ -n "$PROTECTED" ]; then
  # Checar se Dan autorizou via AskUserQuestion (marker com conteudo verificavel, one-shot)
  AUTH_MARKER="/tmp/vanta_dan_authorized_edit"
  if [ -f "$AUTH_MARKER" ]; then
    AUTH_CONTENT=$(cat "$AUTH_MARKER" 2>/dev/null)
    if echo "$AUTH_CONTENT" | grep -q "^VANTA_MARKER|dan_authorized|"; then
      AUTH_TS=$(echo "$AUTH_CONTENT" | cut -d'|' -f3)
      NOW_TS=$(date +%s)
      if [ $((NOW_TS - AUTH_TS)) -le 300 ]; then
        # Autorizado — consumir marker (one-shot)
        rm -f "$AUTH_MARKER"
        exit 0
      fi
    fi
  fi

  jq -n --arg reason "$PROTECTED" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("PROTEGIDO: " + $reason + "\n\nFluxo obrigatorio:\n1. Usar AskUserQuestion pra perguntar ao Dan: Autoriza editar este arquivo?\n2. Se Dan autorizar: scripts/vanta-marker.sh dan_authorized_edit\n3. Tentar novamente\n\ntouch sem conteudo = REJEITADO.\nNUNCA contornar via Bash.")
    }
  }'
  exit 0
fi

exit 0
