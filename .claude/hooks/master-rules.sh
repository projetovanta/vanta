#!/bin/bash
# Hook: PostToolUse → Edit, Write
# HOOK MESTRE — Checklist vivo de TODAS as regras do projeto.
# Roda após cada edit/write em código do projeto.
# Emite lembretes contextuais baseados no que foi editado.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Edit" ] && [ "$TOOL_NAME" != "Write" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar não-código
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/node_modules/*|*.md|*.json|*.env*|*/scripts/*)
    exit 0
    ;;
esac

case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

WARNINGS=""

# ── REGRA 1: AskUserQuestion ──
# Se estou editando código, provavelmente vou precisar tomar decisões
# Lembrete aparece a cada 5 edits
COUNTER_FILE="/tmp/vanta_master_edit_counter"
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$COUNTER_FILE"

if [ "$((COUNT % 5))" -eq 0 ]; then
  WARNINGS="${WARNINGS}
🔶 PERGUNTAS: Toda decisão via AskUserQuestion. Mín 4 opções. Linguagem de produto. Granularidade máxima."
fi

# ── REGRA 2: Tokens ──
if [ "$((COUNT % 7))" -eq 0 ]; then
  WARNINGS="${WARNINGS}
🔶 TOKENS: Economizar. Grep antes de Read. Memória antes de código. Todas edits de 1 arquivo em sequência."
fi

# ── REGRA 3: Entrega completa ──
# Checar se editou backend sem frontend ou vice-versa
case "$FILE_PATH" in
  */services/*|*/stores/*)
    WARNINGS="${WARNINGS}
🔶 ENTREGA: Editou backend/service. Frontend reflete? Memórias atualizadas? Types ok?"
    ;;
  */views/*|*/components/*|*/modules/*)
    WARNINGS="${WARNINGS}
🔶 ENTREGA: Editou frontend/view. Service correspondente existe? Props corretas?"
    ;;
esac

# ── REGRA 4: Supabase ──
NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // .tool_input.content // empty')

if echo "$NEW_STRING" | grep -q '\.from(' 2>/dev/null; then
  WARNINGS="${WARNINGS}
🔶 SUPABASE: Detectado query .from(). Colunas no .select() existem na migration? Timestamps com -03:00?"
fi

if echo "$NEW_STRING" | grep -q '\.insert(' 2>/dev/null || echo "$NEW_STRING" | grep -q '\.update(' 2>/dev/null; then
  WARNINGS="${WARNINGS}
🔶 SUPABASE: INSERT/UPDATE detectado. Campos de auditoria (timestamp + quem)? Optional chaining nos dados?"
fi

# ── REGRA 5: Layout ──
if echo "$NEW_STRING" | grep -qE 'w-\[[0-9]+px\]|fixed inset-0|w-screen|h-screen' 2>/dev/null; then
  WARNINGS="${WARNINGS}
🔶 LAYOUT: Detectado valor fixo ou fixed inset-0. REGRAS: zero w-[Npx], modais absolute inset-0, mobile-first."
fi

# ── REGRA 6: Hooks React ──
if echo "$NEW_STRING" | grep -qE 'useEffect|useState|useCallback|useMemo|useRef' 2>/dev/null; then
  WARNINGS="${WARNINGS}
🔶 REACT: Hook detectado. Todos hooks ANTES de qualquer if/return? Cleanup no useEffect? Deps array correto?"
fi

# ── REGRA 7: Memórias dependentes ──
if [ "$((COUNT % 10))" -eq 0 ]; then
  WARNINGS="${WARNINGS}
🔶 MEMÓRIAS: Verificar EDGES.md. Se mudou schema/store/RPC → atualizar TODOS os consumers. MAPA_PROJETO.md atualizado?"
fi

# Emitir warnings se houver
if [ -n "$WARNINGS" ]; then
  echo "$WARNINGS"
fi

exit 0
