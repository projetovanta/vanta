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

# ═══ GATE 1: Feedbacks lidos? ═══
FEEDBACK_MARKER="/tmp/vanta_feedbacks_read"
if [ ! -f "$FEEDBACK_MARKER" ]; then
  FEEDBACK_COUNT=$(ls "$CLAUDE_PROJECT_DIR"/memory/feedback_*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$FEEDBACK_COUNT" -gt 0 ]; then
    jq -n --arg count "$FEEDBACK_COUNT" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("BLOQUEADO — OBRIGAÇÃO NÃO CUMPRIDA\n\n🔴 Feedbacks não lidos (" + $count + " arquivos)\n\nO QUE FAZER:\n1. Glob: memory/feedback_*.md\n2. Ler cada um (Grep ou Read com offset)\n3. Depois: touch /tmp/vanta_feedbacks_read\n\nSem isso, NENHUMA ação é permitida.")
      }
    }'
    exit 0
  fi
fi

# ═══ GATE 2: Memo ativado? ═══
MEMO_MARKER="/tmp/vanta_memo_ativado"
if [ ! -f "$MEMO_MARKER" ]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "BLOQUEADO — OBRIGAÇÃO NÃO CUMPRIDA\n\n🔴 Memo (Secretário Executivo) não foi ativado\n\nO QUE FAZER:\n1. Ler .claude/agents/memo.md\n2. Criar/atualizar ata do dia em memory/atas/YYYY-MM-DD.md\n3. Depois: touch /tmp/vanta_memo_ativado\n\nSem Memo ativo, NENHUMA ação é permitida."
    }
  }'
  exit 0
else
  # Checar se marker tem menos de 4h
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$MEMO_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -gt 14400 ]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "BLOQUEADO — SESSÃO EXPIRADA\n\n🔴 Memo foi ativado há mais de 4h. Sessão expirou.\n\nO QUE FAZER:\n1. Reativar Memo: atualizar ata do dia\n2. Depois: touch /tmp/vanta_memo_ativado\n\nRenovar sessão pra continuar."
      }
    }'
    exit 0
  fi
fi

# ═══ GATE 3: Equipe consultada antes de perguntar ao Dan? ═══
if [ "$TOOL_NAME" = "AskUserQuestion" ]; then
  EQUIPE_MARKER="/tmp/vanta_equipe_consultada"
  if [ ! -f "$EQUIPE_MARKER" ]; then
    QUESTION=$(echo "$INPUT" | jq -r '.tool_input.questions[0].question // empty')
    WORD_COUNT=$(echo "$QUESTION" | wc -w | tr -d ' ')
    if [ "$WORD_COUNT" -gt 5 ]; then
      jq -n '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "BLOQUEADO — OBRIGAÇÃO NÃO CUMPRIDA\n\n🔴 Fazendo pergunta ao Dan SEM consultar equipe\n\nREGRA: Rafa NUNCA age sozinho.\n\nO QUE FAZER:\n1. Convocar agentes especializados (Luna, Iris, Kai, etc.)\n2. Cada um analisa e assina\n3. Rafa consolida recomendações\n4. Depois: touch /tmp/vanta_equipe_consultada\n5. SÓ ENTÃO formular perguntas ao Dan"
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
        # Verificar se é workaround de Supabase (supabase as any, from(xxx as any), etc)
        if echo "$NEW_STRING" | grep -q "supabase.*as any\|from(.*as any\|\.from.*as any" 2>/dev/null; then
          jq -n '{
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: "BLOQUEADO — WORKAROUND PROIBIDO\n\n🔴 Tentando usar \"as any\" em código Supabase\n\nREGRA: NUNCA contornar tipos. Ordem correta:\n1. Criar migration\n2. Aplicar no Supabase (apply_migration via MCP)\n3. Gerar tipos (generate_typescript_types)\n4. SÓ ENTÃO escrever código que usa a tabela\n\nSe o TypeScript reclama que a tabela não existe, é porque a migration não foi aplicada."
            }
          }'
          exit 0
        fi
      fi
      ;;
  esac
fi

# ═══ GATE 5: Código com erro não pode ser entregue ═══
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
