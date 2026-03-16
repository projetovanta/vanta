#!/bin/bash
# VANTA Marker System — Gera markers com conteudo verificavel.
# touch sem conteudo = rejeitado pelos hooks.
#
# Uso: scripts/vanta-marker.sh <tipo> [dados_extras]
#
# Tipos validos:
#   feedbacks_read    — hash dos feedback_*.md existentes
#   memo_ativado      — path da ata do dia (valida existencia)
#   equipe_consultada — registra timestamp
#   lia_approved      — registra timestamp
#   memo_approved     — registra timestamp
#   preflight_passed  — registra timestamp + resultado
#   dan_authorized    — registra timestamp (TTL 5min)
#   schema_checked    — registra timestamp
#   agent:<nome>      — marca agente como consultado
#   diffcheck_ran     — registra timestamp + resultado
#
# Formato do marker:
#   VANTA_MARKER|<tipo>|<timestamp_epoch>|<hash_prova>

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
TIPO="$1"
EXTRA="$2"

if [ -z "$TIPO" ]; then
  echo "Uso: scripts/vanta-marker.sh <tipo> [dados_extras]"
  echo "Tipos: feedbacks_read, memo_ativado, equipe_consultada, lia_approved, memo_approved, preflight_passed, dan_authorized, schema_checked, agent:<nome>, diffcheck_ran"
  exit 1
fi

NOW=$(date +%s)

case "$TIPO" in
  feedbacks_read)
    # Hash dos nomes dos feedback_*.md existentes
    FEEDBACK_FILES=$(ls "$PROJECT_DIR"/memory/feedback_*.md 2>/dev/null | sort)
    if [ -z "$FEEDBACK_FILES" ]; then
      echo "Nenhum feedback_*.md encontrado"
      exit 1
    fi
    HASH=$(echo "$FEEDBACK_FILES" | md5 -q 2>/dev/null || echo "$FEEDBACK_FILES" | md5sum | cut -d' ' -f1)
    echo "VANTA_MARKER|feedbacks_read|${NOW}|${HASH}" > /tmp/vanta_feedbacks_read
    echo "Marker criado: feedbacks_read (hash: ${HASH})"
    ;;

  memo_ativado)
    TODAY=$(date +%Y-%m-%d)
    ATA_PATH="$PROJECT_DIR/memory/atas/${TODAY}.md"
    if [ ! -f "$ATA_PATH" ]; then
      echo "Ata do dia nao encontrada: $ATA_PATH"
      echo "Crie a ata primeiro, depois rode este comando."
      exit 1
    fi
    ATA_HASH=$(md5 -q "$ATA_PATH" 2>/dev/null || md5sum "$ATA_PATH" | cut -d' ' -f1)
    echo "VANTA_MARKER|memo_ativado|${NOW}|${ATA_HASH}|${ATA_PATH}" > /tmp/vanta_memo_ativado
    echo "Marker criado: memo_ativado (ata: ${ATA_PATH})"
    ;;

  equipe_consultada)
    echo "VANTA_MARKER|equipe_consultada|${NOW}|confirmed" > /tmp/vanta_equipe_consultada
    echo "Marker criado: equipe_consultada"
    ;;

  lia_approved)
    echo "VANTA_MARKER|lia_approved|${NOW}|confirmed" > /tmp/vanta_lia_approved
    echo "Marker criado: lia_approved"
    ;;

  memo_approved)
    echo "VANTA_MARKER|memo_approved|${NOW}|confirmed" > /tmp/vanta_memo_approved
    echo "Marker criado: memo_approved"
    ;;

  preflight_passed)
    echo "VANTA_MARKER|preflight_passed|${NOW}|passed" > /tmp/vanta_preflight_passed
    echo "Marker criado: preflight_passed"
    ;;

  dan_authorized)
    # Cria ambos markers (edit + bash) — Dan autoriza a acao, nao o canal
    echo "VANTA_MARKER|dan_authorized|${NOW}|authorized" > /tmp/vanta_dan_authorized_edit
    echo "VANTA_MARKER|dan_authorized|${NOW}|authorized" > /tmp/vanta_dan_authorized_bash
    echo "Marker criado: dan_authorized edit+bash (TTL 5min)"
    ;;

  dan_authorized_edit)
    echo "VANTA_MARKER|dan_authorized|${NOW}|authorized" > /tmp/vanta_dan_authorized_edit
    echo "Marker criado: dan_authorized_edit (TTL 5min)"
    ;;

  dan_authorized_bash)
    echo "VANTA_MARKER|dan_authorized|${NOW}|authorized" > /tmp/vanta_dan_authorized_bash
    echo "Marker criado: dan_authorized_bash (TTL 5min)"
    ;;

  schema_checked)
    echo "VANTA_MARKER|schema_checked|${NOW}|checked" > /tmp/vanta_schema_checked
    echo "Marker criado: schema_checked"
    ;;

  agent:*)
    AGENT_NAME="${TIPO#agent:}"
    echo "VANTA_MARKER|agent|${NOW}|${AGENT_NAME}" > "/tmp/vanta_agent_${AGENT_NAME}"
    echo "Marker criado: agent:${AGENT_NAME}"
    ;;

  diffcheck_ran)
    RESULT="${EXTRA:-passed}"
    echo "VANTA_MARKER|diffcheck_ran|${NOW}|${RESULT}" > /tmp/vanta_diffcheck_ran
    echo "Marker criado: diffcheck_ran (${RESULT})"
    ;;

  *)
    echo "Tipo desconhecido: $TIPO"
    echo "Tipos validos: feedbacks_read, memo_ativado, equipe_consultada, lia_approved, memo_approved, preflight_passed, dan_authorized, schema_checked, agent:<nome>, diffcheck_ran"
    exit 1
    ;;
esac

exit 0
