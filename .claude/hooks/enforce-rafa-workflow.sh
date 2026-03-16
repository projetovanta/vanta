#!/bin/bash
# Hook: PostToolUse → Edit, Write
# WORKFLOW DO RAFA — Hook consolidado de avisos pos-edit.
# Absorve checagens unicas de: enforce-rafa-obligations, diff-check-reminder, enforce-rafa-workflow
#
# O que checa:
# 1. Agente certo pro contexto (Luna, Kai, Nix, Rio, Zara, Iris)
# 2. Layout (header fixo em Home, max-w em admin, fixed inset-0 em nao-standalone)
# 3. Supabase (as any, migration, schema)
# 4. Contador de edits unificado (diff-check a cada 5, preflight a cada 10)
# 5. Ata do dia

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar memorias, hooks, configs
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/.agents/*|*/scripts/*|*.json|*.sh|*.md)
    exit 0
    ;;
esac

# So .ts/.tsx e .css/.html
case "$FILE_PATH" in
  *.ts|*.tsx|*.css|*.html) ;;
  *) exit 0 ;;
esac

ALERTAS=""

# Helper: valida marker de agente (conteudo verificavel)
agent_valid() {
  local name="$1"
  local marker="/tmp/vanta_agent_${name}"
  if [ -f "$marker" ]; then
    local content
    content=$(cat "$marker" 2>/dev/null)
    if echo "$content" | grep -q "^VANTA_MARKER|agent|"; then
      return 0
    fi
  fi
  return 1
}

# ═══ 1. Agente certo pro contexto ═══

# Frontend
case "$FILE_PATH" in
  */components/*|*/views/*|*/modules/*|*/homes/*|*View*|*Home*|*Page*|*Modal*|*Card*)
    if ! agent_valid "luna"; then
      ALERTAS="${ALERTAS}\nLUNA - Frontend: Editando componente. Luna deveria validar. Marcar: scripts/vanta-marker.sh agent:luna"
    fi
    if ! agent_valid "iris"; then
      if echo "$FILE_PATH" | grep -qi "home\|dashboard\|card\|banner\|hero\|header"; then
        ALERTAS="${ALERTAS}\nIRIS - Visual: Componente visual. Marcar: scripts/vanta-marker.sh agent:iris"
      fi
    fi
    ;;
esac

# Supabase/banco
case "$FILE_PATH" in
  */services/*Service*|*/services/*service*|*supabase*|*migration*)
    if ! agent_valid "kai"; then
      ALERTAS="${ALERTAS}\nKAI - Supabase: Editando service/banco. Marcar: scripts/vanta-marker.sh agent:kai"
    fi
    ;;
esac

# Financeiro
case "$FILE_PATH" in
  *financeiro*|*Financeiro*|*saque*|*reembolso*|*checkout*|*stripe*|*payment*)
    if ! agent_valid "nix"; then
      ALERTAS="${ALERTAS}\nNIX - Pagamentos: Codigo financeiro. Marcar: scripts/vanta-marker.sh agent:nix"
    fi
    ;;
esac

# Mobile
case "$FILE_PATH" in
  *capacitor*|*native*|*push*|*offline*|*PWA*|*pwa*)
    if ! agent_valid "rio"; then
      ALERTAS="${ALERTAS}\nRIO - Mobile: Codigo mobile. Marcar: scripts/vanta-marker.sh agent:rio"
    fi
    ;;
esac

# Seguranca
case "$FILE_PATH" in
  *auth*|*Auth*|*rls*|*RLS*|*security*|*permiss*|*rbac*)
    if ! agent_valid "zara"; then
      ALERTAS="${ALERTAS}\nZARA - Seguranca: Codigo auth/seguranca. Marcar: scripts/vanta-marker.sh agent:zara"
    fi
    ;;
esac

# ═══ 2. Layout ═══
if [ -f "$FILE_PATH" ]; then
  # Header fixo em Home
  if echo "$FILE_PATH" | grep -qi "Home\|home"; then
    if grep -q "backdrop-blur.*border-b.*shrink-0" "$FILE_PATH" 2>/dev/null; then
      ALERTAS="${ALERTAS}\nLAYOUT: Header fixo detectado em Home. Regra: homes usam saudacao inline, SEM header fixo."
    fi
  fi

  # max-w no admin
  if echo "$FILE_PATH" | grep -qi "dashboard\|admin\|Gateway"; then
    if grep -q "max-w-\[500px\]" "$FILE_PATH" 2>/dev/null; then
      ALERTAS="${ALERTAS}\nLAYOUT: max-w-500px detectado em painel admin. Regra: Painel Admin = max-w-4xl SEMPRE."
    fi
  fi

  # fixed inset-0 em componente nao-standalone (absorvido de enforce-rafa-obligations)
  if grep -q "fixed inset-0" "$FILE_PATH" 2>/dev/null; then
    BASENAME_FILE=$(basename "$FILE_PATH" .tsx)
    IS_STANDALONE=$(grep -l "$BASENAME_FILE" "$CLAUDE_PROJECT_DIR/App.tsx" 2>/dev/null | head -1)
    if [ -z "$IS_STANDALONE" ]; then
      ALERTAS="${ALERTAS}\nLAYOUT: 'fixed inset-0' em componente nao-standalone. Usar 'absolute inset-0'."
    fi
  fi
fi

# ═══ 3. Supabase ═══
if [ -f "$FILE_PATH" ]; then
  # as any — checar no conteudo que foi editado, nao no arquivo inteiro
  # (pre-edit GATE 4 ja bloqueia as any no new_string; aqui so lembrete se escapou)
  # Nao alertar sobre as any pre-existente pra evitar falso positivo repetido

  # Migration editada
  case "$FILE_PATH" in
    *migration*|*supabase/migrations*)
      ALERTAS="${ALERTAS}\nMIGRATION EDITADA — Aplicar IMEDIATAMENTE no Supabase + gerar tipos. NUNCA deixar pendente."
      ;;
  esac

  # Schema verificado
  if grep -q "supabase\.\(from\|rpc\)" "$FILE_PATH" 2>/dev/null; then
    SCHEMA_OK=false
    if [ -f "/tmp/vanta_schema_checked" ]; then
      SC_CONTENT=$(cat /tmp/vanta_schema_checked 2>/dev/null)
      if echo "$SC_CONTENT" | grep -q "^VANTA_MARKER|schema_checked|"; then
        SCHEMA_OK=true
      fi
    fi
    if [ "$SCHEMA_OK" = false ]; then
      ALERTAS="${ALERTAS}\nSUPABASE: Codigo usa supabase.from/rpc. Verificou schema real? Marcar: scripts/vanta-marker.sh schema_checked"
    fi
  fi
fi

# ═══ 4. Contador de edits unificado (absorve diff-check-reminder + enforce-rafa-obligations) ═══
EDIT_COUNT_FILE="/tmp/vanta_edit_count_unified"
if [ -f "$EDIT_COUNT_FILE" ]; then
  COUNT=$(cat "$EDIT_COUNT_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$EDIT_COUNT_FILE"

# Reset se diff-check rodou recentemente
DIFF_RAN="/tmp/vanta_diffcheck_ran"
if [ -f "$DIFF_RAN" ]; then
  NOW_TS=$(date +%s)
  RAN_TS=$(stat -f "%m" "$DIFF_RAN" 2>/dev/null || echo 0)
  if [ $((NOW_TS - RAN_TS)) -le 60 ]; then
    echo "0" > "$EDIT_COUNT_FILE"
    COUNT=0
  fi
fi

# A cada 5 edits, lembrar diff-check
if [ "$COUNT" -gt 0 ] && [ $((COUNT % 5)) -eq 0 ]; then
  ALERTAS="${ALERTAS}\nDIFF-CHECK: ${COUNT} edits sem diff-check. Rodar 'npm run diff-check' agora."
fi

# A cada 10 edits, lembrar preflight
if [ "$COUNT" -gt 0 ] && [ $((COUNT % 10)) -eq 0 ]; then
  ALERTAS="${ALERTAS}\nPREFLIGHT: ${COUNT} edits. Lembre-se: 'npm run preflight' antes de entregar."
fi

# ═══ 5. Ata do dia ═══
TODAY=$(date +%Y-%m-%d)
ATA_FILE="$CLAUDE_PROJECT_DIR/memory/atas/${TODAY}.md"
if [ -f "$ATA_FILE" ]; then
  ATA_MOD=$(stat -f "%m" "$ATA_FILE" 2>/dev/null || echo 0)
  NOW_TS=$(date +%s)
  ATA_DIFF=$((NOW_TS - ATA_MOD))
  if [ "$ATA_DIFF" -gt 1200 ]; then
    ALERTAS="${ALERTAS}\nMEMO: Ata do dia nao atualizada ha $(($ATA_DIFF / 60))min. Pedir ao Memo."
  fi
fi

# ═══ Emitir ═══
if [ -n "$ALERTAS" ]; then
  ALERTAS=$(echo "$ALERTAS" | sed 's/^\\n//')
  jq -n --arg alertas "$ALERTAS" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: ("WORKFLOW RAFA — LEMBRETES:\n" + $alertas + "\n\nMarcar agente: touch /tmp/vanta_agent_[nome]")
    }
  }'
fi

exit 0
