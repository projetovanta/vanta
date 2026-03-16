#!/bin/bash
# Hook: PreToolUse → Bash
# SUBSTITUI block-dangerous-git.sh — cobre mais padrões
# Bloqueia: git destrutivo + SQL destrutivo + deploy + rm + commit sem Gate Duplo

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Se e git commit, nao checar conteudo da mensagem como comando perigoso
case "$COMMAND" in
  *"git commit"*|*"git tag"*)
    # Pular direto pro Gate Duplo (mais abaixo)
    SKIP_DANGEROUS_CHECK=true
    ;;
  *)
    SKIP_DANGEROUS_CHECK=false
    ;;
esac

DANGEROUS=""
if [ "$SKIP_DANGEROUS_CHECK" = false ]; then

# Git destrutivo
if echo "$COMMAND" | grep -qEi 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  DANGEROUS="git push --force — pode sobrescrever trabalho remoto"
elif echo "$COMMAND" | grep -qEi 'git\s+reset\s+--hard'; then
  DANGEROUS="git reset --hard — descarta mudanças locais irreversivelmente"
elif echo "$COMMAND" | grep -qEi 'git\s+checkout\s+\.'; then
  DANGEROUS="git checkout . — descarta mudanças não commitadas"
elif echo "$COMMAND" | grep -qEi 'git\s+clean\s+-f'; then
  DANGEROUS="git clean -f — deleta arquivos não rastreados"
elif echo "$COMMAND" | grep -qEi 'git\s+branch\s+-[Dd]'; then
  DANGEROUS="git branch -D — deleta branch sem verificar merge"
elif echo "$COMMAND" | grep -qEi 'git\s+restore\s+\.'; then
  DANGEROUS="git restore . — descarta mudanças não commitadas"

# SQL destrutivo
elif echo "$COMMAND" | grep -qEi 'DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE'; then
  DANGEROUS="SQL destrutivo detectado (DROP/TRUNCATE)"

# Deploy
elif echo "$COMMAND" | grep -qEi 'vercel\s+--prod|vercel\s+deploy'; then
  DANGEROUS="Deploy direto pra produção — precisa autorização"

# rm destrutivo
elif echo "$COMMAND" | grep -qEi 'rm\s+-rf\s+/|rm\s+-rf\s+\.\s|rm\s+-r\s+/'; then
  DANGEROUS="rm -rf em diretorio raiz — potencialmente catastrofico"

# rm de arquivos do projeto (.ts, .tsx, .md, diretorios src/)
elif echo "$COMMAND" | grep -qEi 'rm\s+.*\.(ts|tsx|md|json)\b|rm\s+-r\s+src|rm\s+-r\s+features|rm\s+-r\s+memory'; then
  DANGEROUS="rm de arquivo/diretorio do projeto — requer autorizacao do Dan"

# npm publish
elif echo "$COMMAND" | grep -qEi 'npm\s+publish'; then
  DANGEROUS="npm publish — publicação de pacote"

# supabase reset
elif echo "$COMMAND" | grep -qEi 'supabase\s+db\s+reset'; then
  DANGEROUS="supabase db reset — reseta banco inteiro"

# supabase db push (CLAUDE.md: NUNCA sem confirmacao)
elif echo "$COMMAND" | grep -qEi 'supabase\s+db\s+push'; then
  DANGEROUS="supabase db push — aplica migrations no banco remoto. Requer confirmacao explicita do Dan."
fi

if [ -n "$DANGEROUS" ]; then
  jq -n --arg reason "$DANGEROUS" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("BLOQUEADO: comando destrutivo detectado.\n" + $reason + "\nPedir autorizacao ao Dan via AskUserQuestion antes de prosseguir.")
    }
  }'
  exit 0
fi
fi # fim do SKIP_DANGEROUS_CHECK

# ═══ BYPASS DE HOOKS — Detectar escrita em arquivos protegidos via terminal ═══
# (tambem pula se e git commit — texto da mensagem nao e bypass)
if [ "$SKIP_DANGEROUS_CHECK" = true ]; then
  # git commit — pular bypass check, ir direto pro Gate Duplo
  :
else
# Lista de arquivos protegidos (mesma lista do pre-write-confirm.sh + memorias/atas)
PROTECTED_PATTERNS="REGRAS-GLOBAIS\.md|PROTOCOLO-ANTI-ALUCINACAO\.md|PROTOCOLO-ERRO\.md|PERFIL-DAN\.md|VANTA-EMPRESA\.md|\.env|settings\.json|BRIEFING\.md|REGRAS-DA-EMPRESA\.md|MEMORIA-COMPARTILHADA\.md|CLAUDE\.md|memory/modulo_|memory/sub_|memory/mapa_|memory/graph_|memory/atas/|memory/checklist_|memory/EDGES\.md"

# Detectar comandos que escrevem em arquivo: node -e, python -c, sed -i, echo >, cat >, tee, awk, perl, etc.
WRITE_CMD=""
# node -e / python -c: so conta se tiver operacao de escrita no corpo
if echo "$COMMAND" | grep -qEi 'node\s+-e|node\s+--eval'; then
  if echo "$COMMAND" | grep -qEi 'writeFileSync|writeFile|fs\.write|appendFile|createWriteStream'; then
    WRITE_CMD="node -e com writeFile"
  fi
elif echo "$COMMAND" | grep -qEi 'python[23]?\s+-c'; then
  if echo "$COMMAND" | grep -qEi 'open\(|write\(|\.write|shutil'; then
    WRITE_CMD="python -c com write"
  fi
elif echo "$COMMAND" | grep -qEi 'sed\s+-i'; then
  WRITE_CMD="sed -i"
elif echo "$COMMAND" | grep -qEi 'echo\s+.*>\s*|printf\s+.*>\s*'; then
  WRITE_CMD="echo/printf redirect"
elif echo "$COMMAND" | grep -qEi 'cat\s+.*>\s*|cat\s+<<'; then
  WRITE_CMD="cat redirect/heredoc"
elif echo "$COMMAND" | grep -qEi '\btee\b'; then
  WRITE_CMD="tee"
elif echo "$COMMAND" | grep -qEi 'awk\s+.*-i\b|gawk\s+.*-i\b'; then
  WRITE_CMD="awk -i inplace"
elif echo "$COMMAND" | grep -qEi 'perl\s+-[pi]'; then
  WRITE_CMD="perl -pi"
elif echo "$COMMAND" | grep -qEi 'ruby\s+-[pi]'; then
  WRITE_CMD="ruby -pi"
elif echo "$COMMAND" | grep -qEi 'writeFileSync|writeFile|fs\.write|open.*["\x27]w["\x27]'; then
  WRITE_CMD="fs.writeFileSync/writeFile"
elif echo "$COMMAND" | grep -qEi 'cp\s+.*\s+|mv\s+.*\s+'; then
  WRITE_CMD="cp/mv"
fi

# Se detectou comando de escrita, verificar se menciona arquivo protegido
if [ -n "$WRITE_CMD" ]; then
  MATCHED_FILE=$(echo "$COMMAND" | grep -oEi "$PROTECTED_PATTERNS" | head -1)
  if [ -n "$MATCHED_FILE" ]; then
    # Checar se Dan autorizou via AskUserQuestion (marker com conteudo, one-shot, 5min)
    AUTH_MARKER="/tmp/vanta_dan_authorized_bash"
    if [ -f "$AUTH_MARKER" ]; then
      AUTH_CONTENT=$(cat "$AUTH_MARKER" 2>/dev/null)
      if echo "$AUTH_CONTENT" | grep -q "^VANTA_MARKER|dan_authorized|"; then
        AUTH_TS=$(echo "$AUTH_CONTENT" | cut -d'|' -f3)
        NOW_TS=$(date +%s)
        if [ $((NOW_TS - AUTH_TS)) -le 300 ]; then
          rm -f "$AUTH_MARKER"
          exit 0
        fi
      fi
    fi
    jq -n --arg cmd "$WRITE_CMD" --arg file "$MATCHED_FILE" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("BLOQUEADO: Bypass de hook detectado.\n\nComando: " + $cmd + " tentando escrever em arquivo protegido: " + $file + "\n\nRegra: NUNCA contornar hooks via Bash/node/python/sed.\nSe o hook bloqueou, pedir autorizacao ao Dan via AskUserQuestion.\n\nFluxo correto:\n1. Hook bloqueia\n2. Perguntar ao Dan: Autoriza editar [arquivo]?\n3. So prosseguir com autorizacao explicita")
      }
    }'
    exit 0
  fi
fi
fi # fim do else SKIP_DANGEROUS_CHECK (bypass section)

# ═══ GATE DUPLO + PREFLIGHT — git commit e git push ═══
# Consolidado de: block-commit-dirty + enforce-gate-duplo + pre-execute-confirm
if echo "$COMMAND" | grep -qEi 'git\s+commit|git\s+push'; then
  COMMIT_BLOCKS=""
  NOW_TS=$(date +%s)

  # 1. Lia aprovou? (marker com conteudo verificavel)
  LIA_OK=false
  if [ -f /tmp/vanta_lia_approved ]; then
    LIA_CONTENT=$(cat /tmp/vanta_lia_approved 2>/dev/null)
    if echo "$LIA_CONTENT" | grep -q "^VANTA_MARKER|lia_approved|"; then
      LIA_TS=$(echo "$LIA_CONTENT" | cut -d'|' -f3)
      if [ $((NOW_TS - LIA_TS)) -le 1800 ]; then
        LIA_OK=true
      fi
    fi
  fi
  if [ "$LIA_OK" = false ]; then
    COMMIT_BLOCKS="${COMMIT_BLOCKS}\n- Lia NAO aprovou (scripts/vanta-marker.sh lia_approved)"
  fi

  # 2. Memo aprovou? (marker com conteudo verificavel)
  MEMO_OK=false
  if [ -f /tmp/vanta_memo_approved ]; then
    MEMO_CONTENT=$(cat /tmp/vanta_memo_approved 2>/dev/null)
    if echo "$MEMO_CONTENT" | grep -q "^VANTA_MARKER|memo_approved|"; then
      MEMO_TS=$(echo "$MEMO_CONTENT" | cut -d'|' -f3)
      if [ $((NOW_TS - MEMO_TS)) -le 1800 ]; then
        MEMO_OK=true
      fi
    fi
  fi
  if [ "$MEMO_OK" = false ]; then
    COMMIT_BLOCKS="${COMMIT_BLOCKS}\n- Memo NAO aprovou (scripts/vanta-marker.sh memo_approved)"
  fi

  # 3. Preflight rodou nos ultimos 30min? (marker com conteudo verificavel)
  PREFLIGHT_OK=false
  if [ -f /tmp/vanta_preflight_passed ]; then
    PF_CONTENT=$(cat /tmp/vanta_preflight_passed 2>/dev/null)
    if echo "$PF_CONTENT" | grep -q "^VANTA_MARKER|preflight_passed|"; then
      PF_TS=$(echo "$PF_CONTENT" | cut -d'|' -f3)
      if [ $((NOW_TS - PF_TS)) -le 1800 ]; then
        PREFLIGHT_OK=true
      fi
    fi
  fi
  if [ "$PREFLIGHT_OK" = false ]; then
    COMMIT_BLOCKS="${COMMIT_BLOCKS}\n- Preflight NAO rodou ou expirou (npm run preflight + scripts/vanta-marker.sh preflight_passed)"
  fi

  if [ -n "$COMMIT_BLOCKS" ]; then
    jq -n --arg blocks "$COMMIT_BLOCKS" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("BLOQUEADO: Gate Duplo incompleto.\n" + $blocks + "\n\nFluxo: Lia aprova memorias + Memo aprova ata + Preflight 8/8\nSo entao commit/push.")
      }
    }'
    exit 0
  fi

  # Gate aprovado — limpar markers (one-shot)
  rm -f /tmp/vanta_lia_approved /tmp/vanta_memo_approved
fi

exit 0
