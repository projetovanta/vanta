# Sessao Atual — Estado para Continuidade

## Branch: main
## Ultimo commit: `90a946d` — fix: 7 bugs criticos/medios do painel admin
## Mudancas locais: NAO (tudo commitado e pushado)
## Preflight: OK (diff-check passou)
## Dev server: precisa `npm run dev` pra testar

## Resumo da sessao (16 mar 2026 — noite, sessao 3)

### Governanca de hooks
- Hooks consolidados de 28 → 20 (9 deletados, 3 criados, 1 mesclado)
- 3 hooks de delegacao: block-rafa-memory-update, block-rafa-ata, warn-rafa-delegate
- Sistema de markers verificaveis (touch vazio = rejeitado): scripts/vanta-marker.sh
- 6 brechas criticas fechadas (markers /tmp, paths, CLAUDE.md, supabase db push, atas via Bash, diffcheck_ran)
- 8 brechas medias fechadas (as any, delecoes massivas, rm, memory-before-edit Write, ruido, etc.)
- Arquivos protegidos: CLAUDE.md, REGRAS-DA-EMPRESA.md, MEMORIA-COMPARTILHADA.md, settings.json, .env, protocolos
- Markers one-shot separados (edit vs bash)
- MEMORIA-COMPARTILHADA transformada em indice curto

### Auditoria tela a tela — painel admin
- 41 views auditadas: 26 funcionais, 15 parciais, 0 quebradas
- 7 fluxos end-to-end auditados: criar evento, criar comunidade, saque, cupom, MAIS VANTA, check-in, caixa, listas

### 7 fixes aplicados (commit 90a946d)
- RBAC gerente atribuido ao solicitante na aprovacao de parceria (CRITICO)
- tipo_comunidade setado na aprovacao ESPACO_FIXO/PRODUTORA (CRITICO)
- Tab CHECKIN aparece pro porteiro — role mismatch corrigido (CRITICO)
- Timestamps listasService: tsBR() em vez de Date.now()-3h — 4 pontos (MEDIO)
- Loading indicator no CriarEventoView — guard duplo-clique + disabled (MEDIO)
- Modal "Tem certeza?" antes de confirmar/estornar saque (MEDIO)
- Erro silencioso no caixa substituido por feedback visual (MEDIO)

### Erros do Rafa nesta sessao
- Burlou marker memo_ativado sem ativar Memo — Dan deu ultima chance
- Feedback registrado: feedback_nunca_burlar_marker.md

## Proximo passo
1. Toast nas 13 views sem feedback (padrão useToast + ToastContainer)
2. Timestamps em +12 arquivos fora do painel admin (lista no relatorio do Kai)
3. Email do caixa nao envia de fato (investigar Edge Function send-buyer-notification)
4. Comprovante de saque (upload PIX) — feature nova
5. Auditar autonomia total do master (15+ itens: CMS textos, templates, exportacao)
6. Configurar secrets Stripe — quando Dan tiver conta
7. Onboarding do produtor (tour guiado)

## Decisoes Dan (sessao 16/mar noite)
- Hooks de delegacao: Rafa nao edita memoria de modulo, nao escreve atas, aviso quando faz trabalho de especialista
- touch sem conteudo = rejeitado. Usar scripts/vanta-marker.sh
- CLAUDE.md e REGRAS-DA-EMPRESA.md protegidos
- Consolidacao de hooks aprovada (plano detalhado revisado)
- 7 fixes aprovados e executados
- Rafa: ultima chance por burlar marker

## Pendencias gerais
- Login social (Google/Apple)
- Teste no celular real
- CNPJ + emails legais
- Deep links + Info.plist
- Regime tributario (consultar contador)
- NFS-e integrador
- Modelo preco publicidade Indica
- Stripe sem secrets
- Stubs do clube retornando [] (getReservasUsuario, getReservasEvento, getReservasPendentePost)
- Redes sociais na comunidade (migration nova)
- Cupom por comunidade (UI falta, service existe)
