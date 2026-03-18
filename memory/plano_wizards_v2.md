---
name: Plano Wizards v2 — Comunidade e Evento
description: Plano completo aprovado pelo Dan (18/mar sessão 2) para refatorar wizards de criação de comunidade e evento
type: project
---

# Plano Wizards v2 — Aprovado 18/mar/2026

## Decisões do Dan (6 blocos)

### A — Estrutura dos Wizards
- Comunidade: 3 → 4 steps (Identidade+Fotos → Localização → Operação → Produtores+Taxas)
- Evento: 5 → 4 steps + preview (Essencial → Ingressos+Classificação → Equipe+Listas → Revisar+Publicar)
- Classificação: Formato obrigatório (1), Estilo obrigatório (mín 1, sem teto), Experiência OPCIONAL
- Preview visual no step final (mini-card feed + resumo + ToS)

### B — Rascunho, Componentes e Visual
- Rascunho automático no banco (tabela drafts, auto-save 3s, expira 30 dias, banner "Continuar?")
- Kit completo de peças visuais (FormWizard, InputField, UploadArea, SectionTitle, AccordionSection, CelebrationScreen, DraftBanner, StepIndicator, PreviewCard, TextAreaField)
- Tela de sucesso: check dourado + partículas douradas + Playfair "Evento criado!"
- Labels mínimo 10px

### C — Backend, Segurança e Notificações
- Criação de evento agrupada numa operação atômica (RPC criar_evento_completo)
- Classificação de idade (Livre / +16 / +18) com aviso no checkout
- Validação de fotos: tipo real (magic bytes) + máx 5MB + só JPEG/PNG/WebP
- Notificações para seguidores: limite por comunidade, definido e editável pelo master

### D — Experiência do Usuário e Growth
- Visitante volta direto pro evento após criar conta
- Prova social: só conta quem clicou "Eu vou!" (não compras)
- Urgência: "Últimos ingressos" (>80% vendido) + "Lote encerra em Xh" (só com data real)
- Promoter: só resumo no dia seguinte

### E — MAIS VANTA, Importação e Sócio
- Benefício MV: ícone coroa dourada ao lado do botão "Garantir Ingresso" + "Você tem benefício". Toque expande. Não-membro não vê nada
- Importação: "Deseja importar de evento anterior?" na 1a tela. Checkboxes do que importar. Data sempre nova
- Convite sócio: link direto WhatsApp/email → tela de aceite com split e permissões
- Lembrete equipe: push automático 2h antes

### F — Visual e Priorização
- Acordeões: MANTER roxo e verde
- Ordem: correções críticas → componentes → wizards → rascunho → features

## Ordem de Execução

### Fase 1 — Correções Críticas
1. Guard anti-double-click na criação de comunidade (isLoading)
2. Toast de sucesso/erro em ambos os wizards
3. Passar currentUserId/currentUserNome na CentralEventosView
4. Validação de tamanho de arquivo no upload (max 5MB)
5. Labels 7-8px → 10px mínimo
6. Scroll to error nas validações

### Fase 2 — Componentes Visuais (Design System) ✅ COMPLETA
7-16. 10 componentes criados: FormWizard, StepIndicator, DraftBanner, InputField, TextAreaField, SectionTitle, UploadArea, AccordionSection, CelebrationScreen + 2 barrel exports

### Fase 3 — Reorganizar Wizards ✅ COMPLETA
17. Comunidade: 3→4 steps (Identidade+Fotos → Localização+Capacidade → Operação → Produtores+Taxas)
18. Evento: 5→4 steps + preview (Essencial → Ingressos+Classificação → Equipe+Listas → Revisar+Publicar)
19. Classificação movida pro Step Ingressos (AccordionSection colapsável)
20. Step Revisar com mini preview card + resumo + split (COM_SOCIO) + CelebrationScreen
- Step3Fotos.tsx → _deprecated/ (funcionalidade redistribuída)
- Step1Evento.tsx: prop showClassification adicionada

### Fase 4 — Rascunho ✅ COMPLETA
21. Migration tabela drafts ✅
22. Hook useDraft auto-save debounce 3s ✅
23. DraftBanner inline nos 2 wizards ✅
24. pg_cron limpeza → pendente (não urgente, expira em 30 dias)

### Fase 5 — Backend Robusto ✅ COMPLETA (parcial)
25. RPC criar_evento_completo ✅ (migration + service integrado)
26. RPC criar_comunidade_completa ✅ (migration + comunidadesService.criarCompleta)
27. Migration 16 índices ✅
28. Migration 10 CHECK constraints + UNIQUE dedup ✅
29. classificacao_etaria + limite_notificacoes_mes ✅
30. Edge Function notificações batch → loop de seguidores já funciona (batch pra escala futura)
31. Types supabase.ts regenerados ✅

### Fase 6 — Features Novas ✅ COMPLETA (parcial)
32. Return-to-context visitante ✅
33. Social proof "Eu vou!" nos cards ✅
34. "Últimos ingressos" + timer lote ✅
35. Benefício MV ao lado do botão comprar ✅
36. Classificação etária wizard + badge ✅
37. Deep link convite sócio ✅ (rota /convite-socio/:eventoId/:socioId no deepLinkService)
38. Push 2h antes pra equipe ✅ (INSERT push_agendados no criarEvento)
39. Resumo promoter D+1 ✅ (listasService.gerarResumoPromoter)
