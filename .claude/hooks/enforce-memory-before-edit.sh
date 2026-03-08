#!/bin/bash
# Hook: PreToolUse → Edit
# REGRA: Antes de editar arquivo de módulo, verificar se a memória correspondente foi consultada.
# Usa marcadores em /tmp para rastrear quais memórias foram lidas na sessão.
# Se o arquivo pertence a um módulo e a memória não foi lida → BLOQUEAR.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar arquivos fora do projeto, memórias, configs
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/node_modules/*|*.md|*.json|*.env*|*/scripts/*)
    exit 0
    ;;
esac

# Só checar .ts e .tsx do projeto
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Mapear arquivo → módulo → memória esperada
MEMORY_NEEDED=""

case "$FILE_PATH" in
  */services/clube/*|*/views/*MaisVanta*|*/views/curadoria/tabClube/*|*/ClubeOptIn*|*/DealsMembroSection*)
    MEMORY_NEEDED="modulo_clube"
    ;;
  */services/listasService*|*/views/listas/*|*/TabLista*|*/TabCheckin*)
    MEMORY_NEEDED="modulo_listas"
    ;;
  */services/eventosAdmin*|*/views/eventManagement/*|*/views/eventoDashboard/*|*/criarEvento/*)
    MEMORY_NEEDED="modulo_evento"
    ;;
  */services/cortesias*|*/services/transferencia*|*/wallet/*)
    MEMORY_NEEDED="modulo_carteira"
    ;;
  */services/comunidades*|*/views/comunidades/*|*/community/*)
    MEMORY_NEEDED="modulo_comunidade"
    ;;
  */chatStore*|*/ChatRoom*|*/MessageBubble*|*/messages/*)
    MEMORY_NEEDED="modulo_social"
    ;;
  */authStore*|*/authService*|*/profile/*|*/ProfileView*)
    MEMORY_NEEDED="modulo_perfil_feed"
    ;;
  */services/financeiro*|*/saques*|*/reembolso*)
    MEMORY_NEEDED="modulo_financeiro_completo"
    ;;
  */offlineEventService*|*/offlineDB*|*/checkin/*)
    MEMORY_NEEDED="sub_portaria_caixa"
    ;;
  */notif*|*/pushService*|*/nativePush*)
    MEMORY_NEEDED="sub_notificacoes"
    ;;
esac

# Se não mapeou a nenhum módulo, permitir
if [ -z "$MEMORY_NEEDED" ]; then
  exit 0
fi

# Checar se a memória foi lida nesta sessão (marker em /tmp)
MARKER="/tmp/vanta_memory_read_${MEMORY_NEEDED}"
if [ -f "$MARKER" ]; then
  # Marker existe — checar se tem menos de 2h (sessão ativa)
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -le 7200 ]; then
    exit 0
  fi
fi

jq -n --arg mem "$MEMORY_NEEDED" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: ("BLOQUEADO: Editando arquivo do módulo " + $mem + " sem ter lido a memória.\nREGRA: Ler memory/" + $mem + ".md ANTES de editar código do módulo.\nApós ler, o marker será criado automaticamente.\nUsar: Grep no arquivo de memória ou Read com offset+limit.")
  }
}'
exit 0
