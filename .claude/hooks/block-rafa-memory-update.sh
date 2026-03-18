#!/bin/bash
# Hook: PreToolUse → Edit, Write
# BLOQUEIA Rafa de atualizar memória de módulo que não é dele.
# Quem atualiza memória de módulo = o agente que trabalhou naquele módulo + Lia verifica.
# Rafa só pode atualizar: sessao_atual.md, MEMORY.md, feedback_*.md, e seus próprios arquivos.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Só checar arquivos de memória
case "$FILE_PATH" in
  */memory/*) ;;
  *) exit 0 ;;
esac

BASENAME=$(basename "$FILE_PATH")

# Rafa PODE atualizar esses:
case "$BASENAME" in
  sessao_atual.md|MEMORY.md|feedback_*.md|regras_usuario.md)
    exit 0
    ;;
esac

# Rafa NÃO PODE atualizar memórias de módulo/sub/mapa/componentes/etc
# Essas são responsabilidade do agente especialista + Lia verifica
case "$BASENAME" in
  modulo_*|sub_*|mapa_*|graph_*|checklist_*|admin_*|home_*|event_*|checkout*|wallet*|profile*|search*|radar*|mensagens*|onboarding*|comunidade_*|componentes_*|graficos_*|services_*|painel_*|permissoes_*|categorias*|checkin_*|clube_*|regras_reembolso*|reviews*|relatorios*|infraestrutura*|plataformas*|responsividade*|push_*|rbac_*|projeto_*|mais_vanta_*|audit_*|EDGES.md)
    # Checar se Dan autorizou explicitamente
    AUTH_MARKER="/tmp/vanta_dan_authorized_edit"
    if [ -f "$AUTH_MARKER" ]; then
      AUTH_CONTENT=$(cat "$AUTH_MARKER" 2>/dev/null)
      if echo "$AUTH_CONTENT" | grep -q "^VANTA_MARKER|dan_authorized|"; then
        AUTH_TS=$(echo "$AUTH_CONTENT" | cut -d'|' -f3)
        NOW_TS=$(date +%s)
        if [ $((NOW_TS - AUTH_TS)) -le 1800 ]; then
          # marker reutilizável — TTL 30min (não consumir)
          exit 0
        fi
      fi
    fi
    jq -n --arg file "$BASENAME" '{
      decision: "block",
      reason: ("BLOQUEADO — Rafa NAO atualiza memoria de modulo: " + $file + "\n\nDelegue ao especialista que fez a mudanca + Lia confere.\nSe Dan autorizou: scripts/vanta-marker.sh dan_authorized")
    }'
    exit 0
    ;;
esac

# Arquivos de memória não reconhecidos — avisar
jq -n --arg file "$BASENAME" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: ("Arquivo de memoria nao reconhecido: " + $file + ". Verifique se e responsabilidade do Rafa antes de editar.")
  }
}'
exit 0
