# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: (pendente commit — sessão 18/mar sessão 2)
## Mudancas locais: SIM — 15+ arquivos modificados
## Preflight: diff-check 4/4 OK

## Resumo da sessao (18 mar 2026 — sessao 2)

### O que foi feito

#### Auditoria completa dos fluxos de criação (comunidade + evento)
- 6 especialistas analisaram: Luna (frontend), Kai (backend), Zara (segurança), Iris (visual), Sage (DBA), Maya (produto)
- 5 equipes elaboraram plano completo: Maya, Luna+Iris, Kai+Sage, Zara+Théo, Pixel+Nix
- 8 personas mapeadas (visitante, membro, MV, produtor, sócio, equipe, promoter, master)
- Benchmark 6 concorrentes (Shotgun, Xceed, Dice, Fever, Sympla, Ingresse)
- 26 problemas identificados, priorizados em 6 fases

#### Plano Wizards v2 — 38 itens aprovados pelo Dan (6 blocos A-F)
- Comunidade: 3 → 4 steps (Identidade+Fotos → Localização → Operação → Produtores+Taxas)
- Evento: 5 → 4 steps + preview (Essencial → Ingressos+Classificação → Equipe+Listas → Revisar+Publicar)
- Classificação: Formato obrigatório (1), Estilo obrigatório (mín 1, sem teto), Experiência OPCIONAL
- Rascunho automático no banco (tabela drafts, auto-save 3s, expira 30 dias)
- Kit completo de componentes visuais (FormWizard, InputField, UploadArea, etc.)
- Tela sucesso: check dourado + partículas + Playfair "Evento criado!"
- RPC atômica criar_evento_completo (transação única)
- Classificação de idade (Livre / +16 / +18)
- Notificações seguidores: limite por comunidade, definido pelo master
- Benefício MV: ícone coroa ao lado do botão comprar
- Importação de evento anterior com checkboxes
- Convite sócio via link direto WhatsApp/email
- Push 2h antes pra equipe
- Acordeões: manter roxo e verde
- Plano salvo em memory/plano_wizards_v2.md

#### Fase 1 — Correções Críticas (COMPLETA)
- Guard anti-double-click na criação de comunidade (isCriando + disabled + "Criando...")
- Toast sucesso/erro em ambos wizards (useToast + ToastContainer)
- currentUserId/currentUserNome passados na CentralEventosView → CriarEventoView
- Validação upload: tipo real (JPEG/PNG/WebP) + máx 5MB (Step3Fotos + Step1Evento)
- Labels 7-8px → 10px mínimo (11 arquivos dos wizards)
- Scroll to error (setErroScroll + scrollRef em ambos wizards)

### Arquivos modificados (sessão 2 do 18/mar)
- features/admin/views/criarComunidade/index.tsx (guard, toast, scrollRef, setErroScroll)
- features/admin/views/criarComunidade/Step1Identidade.tsx (labels 10px)
- features/admin/views/criarComunidade/Step2Localizacao.tsx (labels 10px)
- features/admin/views/criarComunidade/Step3Fotos.tsx (labels 10px + validação upload 5MB)
- features/admin/views/CriarEventoView.tsx (toast, scrollRef, ToastContainer)
- features/admin/views/criarEvento/Step1Evento.tsx (labels 10px + validação upload 5MB)
- features/admin/views/criarEvento/Step2Ingressos.tsx (labels 10px)
- features/admin/views/criarEvento/Step3Listas.tsx (labels 10px)
- features/admin/views/criarEvento/Step4EquipeCasa.tsx (labels 10px)
- features/admin/views/criarEvento/Step4EquipeSocio.tsx (labels 10px)
- features/admin/views/criarEvento/Step5Financeiro.tsx (labels 10px)
- features/admin/views/criarEvento/TipoEventoScreen.tsx (labels 10px)
- features/admin/views/criarEvento/CapacidadeModal.tsx (labels 10px)
- features/admin/views/comunidades/CentralEventosView.tsx (props currentUserId/currentUserNome)
- features/admin/views/comunidades/ComunidadeDetalheView.tsx (repassa currentUserId/currentUserNome)

### Próximas fases (plano_wizards_v2.md)
- Fase 2: Componentes visuais (FormWizard, InputField, UploadArea, SectionTitle, AccordionSection, CelebrationScreen)
- Fase 3: Reorganizar wizards (comunidade 4 steps, evento 4 steps + preview)
- Fase 4: Rascunho automático (tabela drafts + auto-save + banner)
- Fase 5: Backend robusto (RPCs atômicas, 16 índices, 10 constraints, view comunidades_admin)
- Fase 6: Features novas (social proof, urgência, MV, deep links sócio, push equipe)

## Pendencias externas (sem mudança)
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
- Android Studio
