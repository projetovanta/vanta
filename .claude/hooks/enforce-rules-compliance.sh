#!/bin/bash
# Hook: PreToolUse → Edit, Write, AskUserQuestion
# GATE MASTER: Bloqueia TODA ação se obrigações não foram cumpridas.
# Rafa SÓ pode trabalhar se:
# 1. Leu TODOS os feedbacks da sessão
# 2. Memo foi ativado (ata do dia existe)
# 3. Consultou equipe antes de perguntar ao Dan
# 4. Zero erros tolerados em qualquer entrega

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Só aplicar em ações que geram output ou decisão
case "$TOOL_NAME" in
  Edit|Write|AskUserQuestion) ;;
  *) exit 0 ;;
esac

# Ignorar arquivos de memória, hooks, config (podem ser editados sem gate)
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  case "$FILE_PATH" in
    */memory/*|*/.claude/*|*/.agents/*|*/scripts/*|*.json|*.sh)
      exit 0
      ;;
  esac
fi

# ═══ GATE 1: Feedbacks lidos? (marker com hash verificavel) ═══
FEEDBACK_MARKER="/tmp/vanta_feedbacks_read"
FEEDBACK_VALID=false
if [ -f "$FEEDBACK_MARKER" ]; then
  # Validar formato: VANTA_MARKER|feedbacks_read|timestamp|hash
  MARKER_CONTENT=$(cat "$FEEDBACK_MARKER" 2>/dev/null)
  if echo "$MARKER_CONTENT" | grep -q "^VANTA_MARKER|feedbacks_read|"; then
    # Extrair hash do marker e comparar com hash real
    MARKER_HASH=$(echo "$MARKER_CONTENT" | cut -d'|' -f4)
    REAL_FILES=$(ls "$CLAUDE_PROJECT_DIR"/memory/feedback_*.md 2>/dev/null | sort)
    REAL_HASH=$(echo "$REAL_FILES" | md5 -q 2>/dev/null || echo "$REAL_FILES" | md5sum | cut -d' ' -f1)
    if [ "$MARKER_HASH" = "$REAL_HASH" ] && [ -n "$MARKER_HASH" ]; then
      # Checar TTL 4h
      MARKER_TS=$(echo "$MARKER_CONTENT" | cut -d'|' -f3)
      NOW_TS=$(date +%s)
      if [ $((NOW_TS - MARKER_TS)) -le 14400 ]; then
        FEEDBACK_VALID=true
      fi
    fi
  fi
fi
if [ "$FEEDBACK_VALID" = false ]; then
  FEEDBACK_COUNT=$(ls "$CLAUDE_PROJECT_DIR"/memory/feedback_*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$FEEDBACK_COUNT" -gt 0 ]; then
    jq -n --arg count "$FEEDBACK_COUNT" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("BLOQUEADO — OBRIGACAO NAO CUMPRIDA\n\nFeedbacks nao lidos ou marker invalido (" + $count + " arquivos)\n\nO QUE FAZER:\n1. Ler TODOS os feedback_*.md\n2. Rodar: scripts/vanta-marker.sh feedbacks_read\n\ntouch sem conteudo = REJEITADO.")
      }
    }'
    exit 0
  fi
fi

# ═══ GATE 2: Memo ativado? (marker com hash da ata verificavel) ═══
MEMO_MARKER="/tmp/vanta_memo_ativado"
MEMO_VALID=false
if [ -f "$MEMO_MARKER" ]; then
  MARKER_CONTENT=$(cat "$MEMO_MARKER" 2>/dev/null)
  if echo "$MARKER_CONTENT" | grep -q "^VANTA_MARKER|memo_ativado|"; then
    MARKER_TS=$(echo "$MARKER_CONTENT" | cut -d'|' -f3)
    ATA_PATH=$(echo "$MARKER_CONTENT" | cut -d'|' -f5)
    NOW_TS=$(date +%s)
    # TTL 4h
    if [ $((NOW_TS - MARKER_TS)) -le 14400 ]; then
      # Validar que a ata existe
      if [ -f "$ATA_PATH" ]; then
        MEMO_VALID=true
      fi
    fi
  fi
fi
if [ "$MEMO_VALID" = false ]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "BLOQUEADO — Memo nao ativado ou marker invalido\n\nO QUE FAZER:\n1. Ler .claude/agents/memo.md\n2. Criar/atualizar ata do dia em memory/atas/YYYY-MM-DD.md\n3. Rodar: scripts/vanta-marker.sh memo_ativado\n\ntouch sem conteudo = REJEITADO."
    }
  }'
  exit 0
fi

# ═══ GATE 3: Equipe consultada antes de perguntar ao Dan? ═══
if [ "$TOOL_NAME" = "AskUserQuestion" ]; then
  EQUIPE_MARKER="/tmp/vanta_equipe_consultada"
  EQUIPE_VALID=false
  if [ -f "$EQUIPE_MARKER" ]; then
    MARKER_CONTENT=$(cat "$EQUIPE_MARKER" 2>/dev/null)
    if echo "$MARKER_CONTENT" | grep -q "^VANTA_MARKER|equipe_consultada|"; then
      EQUIPE_VALID=true
    fi
  fi
  if [ "$EQUIPE_VALID" = false ]; then
    QUESTION=$(echo "$INPUT" | jq -r '.tool_input.questions[0].question // empty')
    WORD_COUNT=$(echo "$QUESTION" | wc -w | tr -d ' ')
    if [ "$WORD_COUNT" -gt 5 ]; then
      jq -n '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "BLOQUEADO — Pergunta ao Dan SEM consultar equipe\n\nO QUE FAZER:\n1. Convocar especialistas\n2. Cada um analisa e assina\n3. Rafa consolida\n4. Rodar: scripts/vanta-marker.sh equipe_consultada\n5. SO ENTAO formular perguntas ao Dan\n\ntouch sem conteudo = REJEITADO."
        }
      }'
      exit 0
    fi
  fi
fi

# ═══ GATE 4: ZERO workarounds 'as any' em código Supabase ═══
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_PATH_CHECK=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // .tool_input.content // empty')
  case "$FILE_PATH_CHECK" in
    *.ts|*.tsx)
      if echo "$NEW_STRING" | grep -q "as any" 2>/dev/null; then
        jq -n '{
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "BLOQUEADO — as any PROIBIDO\n\nRegra: ZERO uso de as any em codigo .ts/.tsx.\nSe e Supabase: migration primeiro, gerar tipos, depois codar.\nSe e outro caso: usar tipos corretos ou generics.\n\nSe REALMENTE necessario por motivo tecnico valido, pedir autorizacao ao Dan."
          }
        }'
        exit 0
      fi
      ;;
  esac
fi

# ═══ GATE 5: Delecoes massivas sem autorizacao ═══
if [ "$TOOL_NAME" = "Edit" ]; then
  OLD_STRING=$(echo "$INPUT" | jq -r '.tool_input.old_string // empty')
  NEW_STRING_DEL=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
  if [ -n "$OLD_STRING" ]; then
    OLD_LINES=$(echo "$OLD_STRING" | wc -l | tr -d ' ')
    NEW_LINES=$(echo "$NEW_STRING_DEL" | wc -l | tr -d ' ')
    # Se removendo mais de 15 linhas e new_string tem menos de 3 linhas
    if [ "$OLD_LINES" -gt 15 ] && [ "$NEW_LINES" -lt 3 ]; then
      jq -n --arg old "$OLD_LINES" --arg new "$NEW_LINES" '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: ("BLOQUEADO — Delecao massiva detectada\n\nRemovendo " + $old + " linhas, substituindo por " + $new + " linhas.\n\nRegra: ZERO remocoes sem autorizacao do Dan.\nSe realmente precisa deletar, pedir autorizacao via AskUserQuestion.")
        }
      }'
      exit 0
    fi
  fi
fi

# ═══ GATE 6: Código com erro não pode ser entregue ═══
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
  case "$FILE_PATH" in
    *.ts|*.tsx)
      # Verificar se último diff-check falhou
      DIFFCHECK_FAIL="/tmp/vanta_diffcheck_failed"
      if [ -f "$DIFFCHECK_FAIL" ]; then
        jq -n '{
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "BLOQUEADO — ERROS NÃO RESOLVIDOS\n\n🔴 Último diff-check FALHOU e os erros não foram resolvidos\n\nO QUE FAZER:\n1. Rodar npm run diff-check\n2. Corrigir TODOS os erros\n3. Quando passar, o bloqueio é removido automaticamente\n\nDan disse: ZERO erros tolerados."
          }
        }'
        exit 0
      fi
      ;;
  esac
fi

exit 0
