#!/bin/bash
# Hook: Stop
# GATE DE ENTREGA — Antes de parar/encerrar, verifica se tudo foi feito:
# 1. diff-check rodou? (TSC + ESLint + layout)
# 2. Arquivos editados têm memórias correspondentes atualizadas?
# 3. sessao_atual.md atualizada?
# 4. Lembrete de checklist completo

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

WARNINGS=""

# ── 1. diff-check rodou recentemente? (marker com conteudo verificavel) ──
DIFF_CHECK_MARKER="/tmp/vanta_diffcheck_ran"
EDIT_COUNTER="/tmp/vanta_edit_count_unified"

if [ -f "$EDIT_COUNTER" ]; then
  EDITS=$(cat "$EDIT_COUNTER" 2>/dev/null || echo 0)
  if [ "$EDITS" -gt 0 ]; then
    DIFFCHECK_OK=false
    if [ -f "$DIFF_CHECK_MARKER" ]; then
      DC_CONTENT=$(cat "$DIFF_CHECK_MARKER" 2>/dev/null)
      if echo "$DC_CONTENT" | grep -q "^VANTA_MARKER|diffcheck_ran|"; then
        DC_TS=$(echo "$DC_CONTENT" | cut -d'|' -f3)
        NOW_TS=$(date +%s)
        if [ $((NOW_TS - DC_TS)) -le 300 ]; then
          DIFFCHECK_OK=true
        fi
      fi
    fi
    if [ "$DIFFCHECK_OK" = false ]; then
      WARNINGS="${WARNINGS}
DIFF-CHECK: $EDITS edits feitos mas diff-check NAO rodou ou expirou. Rodar 'npm run diff-check' ANTES de entregar."
    fi
  fi
fi

# ── 2. Preflight rodou? (marker com conteudo verificavel) ──
PREFLIGHT_MARKER="/tmp/vanta_preflight_passed"
PREFLIGHT_OK=false
if [ -f "$PREFLIGHT_MARKER" ]; then
  PF_CONTENT=$(cat "$PREFLIGHT_MARKER" 2>/dev/null)
  if echo "$PF_CONTENT" | grep -q "^VANTA_MARKER|preflight_passed|"; then
    PF_TS=$(echo "$PF_CONTENT" | cut -d'|' -f3)
    NOW_TS=$(date +%s)
    if [ $((NOW_TS - PF_TS)) -le 1800 ]; then
      PREFLIGHT_OK=true
    fi
  fi
fi
if [ "$PREFLIGHT_OK" = false ]; then
  WARNINGS="${WARNINGS}
PREFLIGHT: NAO rodou ou expirou. Rodar 'npm run preflight' ANTES de entregar."
fi

# ── 3. sessao_atual.md atualizada? ──
SESSAO="$PROJECT_DIR/memory/sessao_atual.md"
# Fallback
if [ ! -f "$SESSAO" ]; then
  SESSAO="$HOME/.claude/projects/-Users-vanta-prevanta/memory/sessao_atual.md"
fi
if [ -f "$SESSAO" ]; then
  NOW_TS=$(date +%s)
  SESSAO_TS=$(stat -f "%m" "$SESSAO" 2>/dev/null || echo 0)
  SESSAO_DIFF=$((NOW_TS - SESSAO_TS))
  if [ "$SESSAO_DIFF" -gt 600 ]; then
    WARNINGS="${WARNINGS}
🔴 SESSÃO: sessao_atual.md não atualizada há mais de 10 min. Atualizar ANTES de encerrar."
  fi
fi

# ── 4. Checklist completo ──
WARNINGS="${WARNINGS}

📋 CHECKLIST DE ENTREGA (verificar ANTES de dizer 'pronto'):
  □ TSC: 0 erros (via diff-check ou preflight)
  □ ESLint: 0 warnings (max-warnings=0)
  □ Frontend: view/componente renderiza e funciona
  □ Backend: service/RPC testado end-to-end
  □ Supabase: migrations aplicadas + types/supabase.ts regenerado (se mudou schema)
  □ Memórias: TODAS as afetadas atualizadas (módulo + sub-módulo + EDGES + MAPA_PROJETO)
  □ sessao_atual.md: estado atual salvo
  □ Perguntas: TODAS via AskUserQuestion (mín 4 opções, linguagem produto)"

if [ -n "$WARNINGS" ]; then
  echo "$WARNINGS"
fi

exit 0
