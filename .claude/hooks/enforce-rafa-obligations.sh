#!/bin/bash
# Hook: PostToolUse → Edit, Write
# REGRA MASTER: Verifica TODAS as obrigações do Rafa após cada edição de código.
# Se alguma obrigação não foi cumprida → BLOQUEIA com instruções claras.
#
# Obrigações verificadas:
# 1. Feedbacks lidos nesta sessão
# 2. Memo ativado nesta sessão
# 3. Equipe consultada antes de decisões
# 4. diff-check rodado recentemente (após grupo de edits)
# 5. Layout: max-w-4xl no admin, zero scroll horizontal
# 6. Zero erros tolerados — diff-check DEVE passar

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Só checar após editar/escrever código do projeto
case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar memórias, hooks, configs, scripts, markdown
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/.agents/*|*/scripts/*|*.json|*.sh|*.md)
    exit 0
    ;;
esac

# Só checar .ts e .tsx do projeto
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

ALERTAS=""

# ── 1. Feedbacks lidos? ──
if [ ! -f "/tmp/vanta_feedbacks_read" ]; then
  ALERTAS="${ALERTAS}\n🔴 FEEDBACKS NÃO LIDOS — Ler TODOS os feedback_*.md antes de qualquer ação."
fi

# ── 2. Memo ativado? ──
if [ ! -f "/tmp/vanta_memo_ativado" ]; then
  ALERTAS="${ALERTAS}\n🔴 MEMO NÃO ATIVADO — Ativar Memo (secretário executivo) e criar/atualizar ata do dia."
fi

# ── 3. Equipe consultada? ──
if [ ! -f "/tmp/vanta_equipe_consultada" ]; then
  ALERTAS="${ALERTAS}\n🟡 EQUIPE NÃO CONSULTADA — Lembre-se: Rafa NUNCA age sozinho. Convoque especialistas antes de decisões."
fi

# ── 4. diff-check rodado recentemente? ──
DIFF_MARKER="/tmp/vanta_diffcheck_last"
if [ -f "$DIFF_MARKER" ]; then
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$DIFF_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  # Se faz mais de 15 min desde o último diff-check
  if [ "$DIFF" -gt 900 ]; then
    ALERTAS="${ALERTAS}\n🟡 DIFF-CHECK ATRASADO — Rodar 'npm run diff-check' após cada grupo de edits. Último: há $(($DIFF / 60))min."
  fi
else
  # Contar quantas edições em .ts/.tsx foram feitas (via /tmp markers)
  EDIT_COUNT_FILE="/tmp/vanta_edit_count"
  if [ -f "$EDIT_COUNT_FILE" ]; then
    COUNT=$(cat "$EDIT_COUNT_FILE")
    COUNT=$((COUNT + 1))
  else
    COUNT=1
  fi
  echo "$COUNT" > "$EDIT_COUNT_FILE"
  # A cada 5 edições sem diff-check, alertar
  if [ $((COUNT % 5)) -eq 0 ]; then
    ALERTAS="${ALERTAS}\n🟡 ${COUNT} EDIÇÕES SEM DIFF-CHECK — Rodar 'npm run diff-check' agora."
  fi
fi

# ── 5. Verificar layout do arquivo editado ──
if [ -f "$FILE_PATH" ]; then
  # Checar fixed inset-0 (proibido em componentes, ok em standalone)
  if grep -q "fixed inset-0" "$FILE_PATH" 2>/dev/null; then
    # Verificar se é standalone (App.tsx route)
    IS_STANDALONE=$(grep -l "$(basename "$FILE_PATH" .tsx)" "$CLAUDE_PROJECT_DIR/App.tsx" 2>/dev/null | head -1)
    if [ -z "$IS_STANDALONE" ]; then
      ALERTAS="${ALERTAS}\n🔴 LAYOUT: 'fixed inset-0' detectado em componente não-standalone. Usar 'absolute inset-0'."
    fi
  fi
fi

# ── Emitir alertas como contexto (não bloquear, mas avisar) ──
if [ -n "$ALERTAS" ]; then
  # Remover newline inicial
  ALERTAS=$(echo "$ALERTAS" | sed 's/^\\n//')
  jq -n --arg alertas "$ALERTAS" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: ("⚠️ RAFA — OBRIGAÇÕES PENDENTES:\n" + $alertas + "\n\nREGRAS: Ler feedbacks + Ativar Memo + Consultar equipe + diff-check a cada grupo de edits + Zero erros + max-w-4xl no admin + Preflight antes de entregar")
    }
  }'
fi

exit 0
