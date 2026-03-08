#!/bin/bash
# Hook: Stop
# GATE DE ENTREGA — Antes de parar/encerrar, verifica se tudo foi feito:
# 1. diff-check rodou? (TSC + ESLint + layout)
# 2. Arquivos editados têm memórias correspondentes atualizadas?
# 3. sessao_atual.md atualizada?
# 4. Lembrete de checklist completo

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

WARNINGS=""

# ── 1. diff-check rodou recentemente? ──
DIFF_CHECK_MARKER="/tmp/vanta_diffcheck_ran"
EDIT_COUNTER="/tmp/vanta_edit_counter"

if [ -f "$EDIT_COUNTER" ]; then
  EDITS=$(cat "$EDIT_COUNTER" 2>/dev/null || echo 0)
  if [ "$EDITS" -gt 0 ]; then
    if [ ! -f "$DIFF_CHECK_MARKER" ]; then
      WARNINGS="${WARNINGS}
🔴 DIFF-CHECK: $EDITS edits feitos mas diff-check NÃO rodou. Rodar 'npm run diff-check' ANTES de entregar."
    else
      NOW_TS=$(date +%s)
      MARKER_TS=$(stat -f "%m" "$DIFF_CHECK_MARKER" 2>/dev/null || echo 0)
      DIFF=$((NOW_TS - MARKER_TS))
      if [ "$DIFF" -gt 300 ]; then
        WARNINGS="${WARNINGS}
🔴 DIFF-CHECK: Última execução há mais de 5 min e houve $EDITS edits depois. Rodar novamente."
      fi
    fi
  fi
fi

# ── 2. Preflight rodou? ──
PREFLIGHT_MARKER="/tmp/vanta_preflight_passed"
if [ ! -f "$PREFLIGHT_MARKER" ]; then
  WARNINGS="${WARNINGS}
🔴 PREFLIGHT: NÃO rodou nesta sessão. Rodar 'npm run preflight' ANTES de entregar."
else
  NOW_TS=$(date +%s)
  MARKER_TS=$(stat -f "%m" "$PREFLIGHT_MARKER" 2>/dev/null || echo 0)
  DIFF=$((NOW_TS - MARKER_TS))
  if [ "$DIFF" -gt 1800 ]; then
    WARNINGS="${WARNINGS}
🟡 PREFLIGHT: Última execução há mais de 30 min. Considerar rodar novamente se houve edits."
  fi
fi

# ── 3. sessao_atual.md atualizada? ──
SESSAO="$HOME/.claude/projects/-Users-vanta-Documents-prevanta/memory/sessao_atual.md"
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
