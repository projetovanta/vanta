#!/bin/bash
# Hook: PostToolUse → Edit, Write
# FISCALIZA Luna — garante que ela só mexe no que foi pedido.
# Se Luna edita arquivo fora do escopo declarado, ALERTA.
# Se Luna cria arquivo novo, BLOQUEIA (precisa autorização).

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

# Só ativar quando Luna está ativa
LUNA_MARKER="/tmp/vanta_agent_luna"
if [ ! -f "$LUNA_MARKER" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
BASENAME=$(basename "$FILE_PATH")

ALERTAS=""

# ═══ 1. Luna NÃO cria arquivos novos sem autorização ═══
if [ "$TOOL_NAME" = "Write" ]; then
  # Write = arquivo novo ou reescrita total
  # Se o arquivo não existia antes do Write, é criação
  ALERTAS="${ALERTAS}\n⚠️ LUNA SCOPE: Write detectado em ${BASENAME}. Luna NÃO cria arquivos novos sem autorização explícita do Rafa/Dan. Se foi autorizado, ok. Se não, reverter."
fi

# ═══ 2. Luna NÃO mexe em memórias ═══
case "$FILE_PATH" in
  */memory/*|*/.agents/*|*/.claude/*)
    ALERTAS="${ALERTAS}\n🔴 LUNA SCOPE: Luna editou ${BASENAME} que é memória/config. Luna só edita código .ts/.tsx/.css. Memórias são responsabilidade de Lia/Memo."
    ;;
esac

# ═══ 3. Luna NÃO mexe em migrations ═══
case "$FILE_PATH" in
  *migration*|*supabase/*)
    ALERTAS="${ALERTAS}\n🔴 LUNA SCOPE: Luna editou ${BASENAME} que é migration/banco. Isso é responsabilidade de Kai."
    ;;
esac

# ═══ 4. Luna NÃO mexe em testes ═══
case "$FILE_PATH" in
  *test*|*spec*|*.test.*)
    ALERTAS="${ALERTAS}\n🔴 LUNA SCOPE: Luna editou ${BASENAME} que é teste. Isso é responsabilidade de Val."
    ;;
esac

# ═══ 5. Luna NÃO mexe em segurança/auth ═══
case "$FILE_PATH" in
  *auth*|*Auth*|*rls*|*security*|*permiss*)
    ALERTAS="${ALERTAS}\n⚠️ LUNA SCOPE: Luna editou ${BASENAME} que envolve auth/segurança. Isso é responsabilidade de Zara. Se foi autorizado, ok."
    ;;
esac

# ═══ Emitir ═══
if [ -n "$ALERTAS" ]; then
  ALERTAS=$(echo "$ALERTAS" | sed 's/^\\n//')
  jq -n --arg alertas "$ALERTAS" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $alertas
    }
  }'
fi

exit 0
