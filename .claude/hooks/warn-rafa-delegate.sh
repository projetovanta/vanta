#!/bin/bash
# Hook: PreToolUse → Edit, Write, Bash
# AVISA quando Rafa está fazendo trabalho de especialista em vez de delegar.
# Se Rafa está editando código, memória de módulo, ou rodando comando técnico,
# o hook sugere o agente certo pra delegar.

INPUT=$(cat /dev/stdin)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

case "$TOOL_NAME" in
  Edit|Write|Bash) ;;
  *) exit 0 ;;
esac

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

SUGESTAO=""

# ═══ CÓDIGO — Rafa não deveria estar editando código ═══
if [ -n "$FILE_PATH" ]; then
  case "$FILE_PATH" in
    *.ts|*.tsx)
      # Checar tipo de código
      case "$FILE_PATH" in
        */components/*|*/views/*|*/homes/*|*View*|*Home*|*Page*|*Modal*|*Card*|*Banner*|*Header*|*Footer*|*Tab*)
          SUGESTAO="Luna - Frontend - /engenheiro-frontend"
          ;;
        */services/*|*Service*|*service*)
          case "$FILE_PATH" in
            *financeiro*|*Financeiro*|*saque*|*reembolso*|*stripe*|*payment*|*checkout*)
              SUGESTAO="Nix - Pagamentos - /engenheiro-pagamentos"
              ;;
            *)
              SUGESTAO="Kai - Supabase - /arquiteto-supabase"
              ;;
          esac
          ;;
        *capacitor*|*native*|*push*|*offline*|*pwa*)
          SUGESTAO="Rio - Mobile - /engenheiro-mobile"
          ;;
        *auth*|*Auth*|*rls*|*security*|*permiss*|*rbac*)
          SUGESTAO="Zara - Seguranca - /engenheiro-seguranca"
          ;;
        *test*|*Test*|*spec*|*Spec*|*.test.*)
          SUGESTAO="Val - Qualidade - /engenheiro-qualidade"
          ;;
        # Sem fallback generico — so avisa quando o contexto e claro
        # Arquivos que nao batem em nenhum padrao passam sem aviso
      esac
      ;;
    # Memória de módulo — já bloqueado por block-rafa-memory-update, mas reforçar
    */memory/modulo_*|*/memory/sub_*)
      SUGESTAO="O especialista que fez a mudanca + Lia - Memoria - /guardiao-memoria"
      ;;
    # Ata — já bloqueado por block-rafa-ata, mas reforçar
    */atas/*)
      SUGESTAO="Memo - Secretario - /memo"
      ;;
    # Hooks e configs do Claude — Rafa pode fazer isso (é governança)
    */.claude/*|*/.agents/*|*/scripts/*)
      exit 0
      ;;
    # CSS, config, etc — Rafa pode
    *.json|*.sh|*.md|*.css|*.html)
      exit 0
      ;;
  esac
fi

# ═══ COMANDOS TÉCNICOS — Rafa não deveria rodar sozinho ═══
if [ -n "$COMMAND" ]; then
  case "$COMMAND" in
    # Scripts de projeto — Rafa pode rodar (coordenação)
    *"npm run"*|*preflight*|*diff-check*|*audit*|*explore*|*deps*|*props*|*knip*|*security*|*bundle*|*lines*|*tsc*|*git*)
      exit 0
      ;;
    # Deploy/migration — delegar
    *supabase*|*deploy*|*vercel*)
      SUGESTAO="Kai - Supabase ou Ops - DevOps"
      ;;
  esac
fi

# ═══ Emitir aviso (não bloqueia, só avisa) ═══
if [ -n "$SUGESTAO" ]; then
  jq -n --arg agente "$SUGESTAO" --arg file "$FILE_PATH" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: ("🔄 DELEGAÇÃO — Rafa, você está fazendo trabalho de especialista.\n\nArquivo: " + $file + "\nDelega pra: " + $agente + "\n\nRegra: Rafa coordena, não executa código. Se o Dan autorizou explicitamente, pode continuar. Caso contrário, delegue.")
    }
  }'
fi

exit 0
