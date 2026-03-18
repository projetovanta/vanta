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

### Fase 2 — Componentes Visuais (Design System)
7. FormWizard (progress, steps, draft)
8. InputField (validação inline)
9. TextAreaField (contador)
10. UploadArea (crop + validação tamanho + camera mobile)
11. SectionTitle (Playfair)
12. AccordionSection
13. StepIndicator (barra dourada)
14. CelebrationScreen (check + partículas)
15. DraftBanner
16. PreviewCard

### Fase 3 — Reorganizar Wizards
17. Comunidade: 4 steps usando componentes novos
18. Evento: 4 steps + preview usando componentes novos
19. Importação de evento anterior com checkboxes
20. Classificação de idade no wizard

### Fase 4 — Rascunho
21. Migration tabela drafts
22. Auto-save debounce 3s
23. Banner "Continuar de onde parou?"
24. pg_cron limpeza 30 dias

### Fase 5 — Backend Robusto
25. RPC criar_evento_completo (transação atômica)
26. RPC criar_comunidade_completa
27. Migration índices (16)
28. Migration CHECK constraints (10)
29. Migration view comunidades_admin + 5 colunas
30. Edge Function notificações batch seguidores
31. Campo limite_notificacoes na comunidade

### Fase 6 — Features Novas
32. Visitante retorna ao evento após cadastro
33. Prova social "Eu vou!" nos cards
34. "Últimos ingressos" + timer lote
35. Benefício MV ao lado do botão comprar
36. Link direto aceite sócio
37. Push 2h antes pra equipe
38. Resumo promoter D+1
