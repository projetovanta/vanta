#!/bin/bash
# Hook: Stop
# Lembra Claude de atualizar sessao_atual.md se passou muito tempo.
# NÃO bloqueia — apenas sugere.

INPUT=$(cat /dev/stdin)

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Checar ambos os locais possíveis
SESSAO1="$PROJECT_DIR/memory/sessao_atual.md"
SESSAO2="$HOME/.claude/projects/-Users-vanta-Documents-prevanta/memory/sessao_atual.md"

SESSAO=""
if [ -f "$SESSAO1" ]; then SESSAO="$SESSAO1";
elif [ -f "$SESSAO2" ]; then SESSAO="$SESSAO2";
else exit 0; fi

# Se sessao_atual.md foi atualizado nos últimos 10 min, OK
NOW_TS=$(date +%s)
SESSAO_TS=$(stat -f "%m" "$SESSAO" 2>/dev/null || echo 0)
SESSAO_DIFF=$((NOW_TS - SESSAO_TS))

if [ "$SESSAO_DIFF" -le 600 ]; then
  exit 0
fi

# Mais de 10 min sem atualizar — sugerir (NÃO bloquear)
echo "⚠️ SESSÃO: sessao_atual.md não foi atualizada há mais de 10 minutos. Atualizar ANTES de encerrar."
echo "⚠️ PERGUNTAS: Toda decisão DEVE usar AskUserQuestion — NUNCA perguntar como texto normal. Mínimo 4 opções. Linguagem de produto, zero termos técnicos."
exit 0
