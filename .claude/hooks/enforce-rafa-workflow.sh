#!/bin/bash
# Hook: PostToolUse → Edit, Write
# WORKFLOW DO RAFA: verifica se o fluxo correto está sendo seguido.
# Emite alertas contextuais baseados no que está sendo editado.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Ignorar memórias, hooks, configs
case "$FILE_PATH" in
  */memory/*|*/.claude/*|*/.agents/*|*/scripts/*|*.json|*.sh|*.md)
    exit 0
    ;;
esac

# Só .ts/.tsx
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

ALERTAS=""

# ═══ REGRA 1: Agente certo pro contexto ═══

# Frontend (componentes, views, pages)
case "$FILE_PATH" in
  */components/*|*/views/*|*/modules/*|*/homes/*|*View*|*Home*|*Page*|*Modal*|*Card*)
    if [ ! -f "/tmp/vanta_agent_luna" ]; then
      ALERTAS="${ALERTAS}\n👩‍💻 LUNA (Frontend): Você está editando código frontend. Luna deveria ter sido consultada sobre arquitetura de componentes, performance e acessibilidade."
    fi
    # Visual check
    if [ ! -f "/tmp/vanta_agent_iris" ]; then
      if echo "$FILE_PATH" | grep -qi "home\|dashboard\|card\|banner\|hero\|header"; then
        ALERTAS="${ALERTAS}\n🎨 IRIS (Visual): Editando componente visual. Iris deveria validar cores, hierarquia e identidade VANTA."
      fi
    fi
    ;;
esac

# Supabase/banco (services, migrations, RPCs)
case "$FILE_PATH" in
  */services/*Service*|*/services/*service*|*supabase*|*migration*)
    if [ ! -f "/tmp/vanta_agent_kai" ]; then
      ALERTAS="${ALERTAS}\n🗄️ KAI (Supabase): Editando service/banco. Kai deveria validar schema, queries e RLS."
    fi
    ;;
esac

# Financeiro
case "$FILE_PATH" in
  *financeiro*|*Financeiro*|*saque*|*reembolso*|*checkout*|*stripe*|*payment*)
    if [ ! -f "/tmp/vanta_agent_nix" ]; then
      ALERTAS="${ALERTAS}\n💰 NIX (Pagamentos): Editando código financeiro. Nix deveria validar fluxos de pagamento e segurança."
    fi
    ;;
esac

# Mobile/Capacitor
case "$FILE_PATH" in
  *capacitor*|*native*|*push*|*offline*|*PWA*|*pwa*)
    if [ ! -f "/tmp/vanta_agent_rio" ]; then
      ALERTAS="${ALERTAS}\n📱 RIO (Mobile): Editando código mobile. Rio deveria validar compatibilidade e performance."
    fi
    ;;
esac

# Segurança
case "$FILE_PATH" in
  *auth*|*Auth*|*rls*|*RLS*|*security*|*permiss*|*rbac*)
    if [ ! -f "/tmp/vanta_agent_zara" ]; then
      ALERTAS="${ALERTAS}\n🔒 ZARA (Segurança): Editando código de auth/segurança. Zara deveria revisar."
    fi
    ;;
esac

# ═══ REGRA 2: Padrão de layout em componentes visuais ═══
if [ -f "$FILE_PATH" ]; then
  # Checar se tem header fixo dentro de componente home (deveria ser inline)
  if echo "$FILE_PATH" | grep -qi "Home\|home"; then
    if grep -q "backdrop-blur.*border-b.*shrink-0" "$FILE_PATH" 2>/dev/null; then
      ALERTAS="${ALERTAS}\n🔴 LAYOUT: Header fixo (backdrop-blur + border-b + shrink-0) detectado em Home. Regra: homes usam saudação inline no conteúdo, SEM header fixo próprio."
    fi
  fi

  # Checar max-w no admin
  if echo "$FILE_PATH" | grep -qi "dashboard\|admin\|Gateway"; then
    if grep -q "max-w-\[500px\]" "$FILE_PATH" 2>/dev/null; then
      ALERTAS="${ALERTAS}\n🔴 LAYOUT: max-w-[500px] detectado em painel admin. Regra: Painel Admin = max-w-4xl SEMPRE."
    fi
  fi
fi

# ═══ REGRA 3: Supabase — migration antes de código ═══
if [ -f "$FILE_PATH" ]; then
  # Detectar referência a tabela que pode não existir
  # Se o arquivo usa supabase.from('xxx') e é um service NOVO, avisar
  if grep -q "as any" "$FILE_PATH" 2>/dev/null; then
    ALERTAS="${ALERTAS}\n🔴 WORKAROUND 'as any' DETECTADO em $FILE_PATH — PROIBIDO. Regra: migration primeiro → gerar tipos → depois codar. Nunca contornar tipos inexistentes."
  fi

  # Se editando migration, lembrar de aplicar
  case "$FILE_PATH" in
    *migration*|*supabase/migrations*)
      ALERTAS="${ALERTAS}\n🔴 MIGRATION EDITADA — Aplicar IMEDIATAMENTE no Supabase (apply_migration via MCP) + gerar tipos (generate_typescript_types). NUNCA deixar pendente."
      ;;
  esac

  # Se criando/editando service que usa supabase.from, verificar se consultou schema
  if grep -q "supabase\.\(from\|rpc\)" "$FILE_PATH" 2>/dev/null; then
    if [ ! -f "/tmp/vanta_schema_checked" ]; then
      ALERTAS="${ALERTAS}\n🟡 SUPABASE: Código usa supabase.from/rpc. Verificou se as tabelas/RPCs existem no schema real? Consultar via MCP (list_tables, execute_sql) ANTES de codar. Depois: touch /tmp/vanta_schema_checked"
    fi
  fi
fi

# ═══ REGRA 5: Lembrete de preflight ═══
EDIT_COUNT_FILE="/tmp/vanta_edit_count_total"
if [ -f "$EDIT_COUNT_FILE" ]; then
  COUNT=$(cat "$EDIT_COUNT_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$EDIT_COUNT_FILE"

# A cada 10 edições, lembrar do preflight
if [ $((COUNT % 10)) -eq 0 ]; then
  ALERTAS="${ALERTAS}\n⚡ PREFLIGHT: ${COUNT} edições nesta sessão. Lembre-se: 'npm run preflight' é OBRIGATÓRIO antes de declarar qualquer entrega ao Dan."
fi

# ═══ REGRA 4: Ata do dia ═══
TODAY=$(date +%Y-%m-%d)
ATA_FILE="$CLAUDE_PROJECT_DIR/memory/atas/${TODAY}.md"
if [ -f "$ATA_FILE" ]; then
  ATA_MOD=$(stat -f "%m" "$ATA_FILE" 2>/dev/null || echo 0)
  NOW_TS=$(date +%s)
  ATA_DIFF=$((NOW_TS - ATA_MOD))
  # Se ata não atualizada há mais de 20min
  if [ "$ATA_DIFF" -gt 1200 ]; then
    ALERTAS="${ALERTAS}\n📋 MEMO: Ata do dia não atualizada há $(($ATA_DIFF / 60))min. Registrar ações e decisões."
  fi
fi

# ═══ Emitir ═══
if [ -n "$ALERTAS" ]; then
  ALERTAS=$(echo "$ALERTAS" | sed 's/^\\n//')
  jq -n --arg alertas "$ALERTAS" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: ("⚠️ WORKFLOW RAFA — LEMBRETES:\n" + $alertas + "\n\nMarcar agente como consultado: touch /tmp/vanta_agent_[nome]")
    }
  }'
fi

exit 0
