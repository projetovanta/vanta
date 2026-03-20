# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-18
# Memória — Componentes Compartilhados

## Diretório: components/ (37+ arquivos)

## Principais
| Componente | Linhas | Função |
|---|---|---|
| ~~ConviteSocioModal~~ | — | REMOVIDO — negociação sócio fora do app |
| ~~NegociacaoSocioView~~ | — | REMOVIDO — negociação fora do app (decisão Dan) |
| `AuthModal.tsx` | 531 | Login/cadastro multi-step |
| `NotificationPanel.tsx` | 432 | Painel lateral notificações |
| `DevQuickLogin.tsx` | 356 | Login rápido dev — filtra profiles com auth.users, mostra role efetivo via RBAC, draggable |
| `AppModals.tsx` | 227 | Container de todos modais do app |
| `EventCard.tsx` | ~180 | Card de evento (imagem, nome, data, local, preço, tag estilo, distLabel, confirmados "X pessoas vão", percentVendido "Últimos ingressos") |
| `CelebrationScreen.tsx` | ~130 | Tela de sucesso (check dourado + partículas + Playfair + animações sequenciais, props: icon check/clock) |
| **components/wizard/** | | |
| `FormWizard.tsx` | ~100 | Container wizard (header + StepIndicator + scroll + footer + safe area) |
| `StepIndicator.tsx` | ~60 | Barra progresso dourada 4px + labels responsivos |
| `DraftBanner.tsx` | ~70 | Banner "Rascunho não finalizado" (localStorage check) |
| **components/form/** | | |
| `InputField.tsx` | ~80 | Input com label, erro inline, prefix/suffix, contador, required asterisco dourado |
| `TextAreaField.tsx` | ~70 | Textarea com contador colorido (zinc/amber/red por %) |
| `SectionTitle.tsx` | ~40 | Título Playfair Display SC italic + ícone + subtitle + action |
| `UploadArea.tsx` | ~100 | Upload com validação tipo/tamanho 5MB + preview + aspect ratio |
| `AccordionSection.tsx` | ~80 | Seção colapsável com animação max-height + ChevronDown |
| `Toast.tsx` | — | Toast de feedback |
| `VantaPickerModal.tsx` | — | Picker modal customizado (substitui select nativo) |
| `VantaDropdown.tsx` | — | Dropdown customizado global |
| `ReviewModal.tsx` | — | Modal review de evento |
| `BottomSheet.tsx` | 38 | Wrapper bottom-sheet com safe-area + backdrop + pill handle + animação |
| `EmptyState.tsx` | 48 | Empty state reutilizável — ícone dourado + título + subtexto + CTA + variante compact |
| `Skeleton.tsx` | 84 | Shimmer: base + EventCard + TicketCard + Profile + PersonCard + ChatItem + HighlightCard |
| `BatchActionBar.tsx` | 65 | Barra de ações em lote — count + botões de ação + clear |
| `ErrorBoundary.tsx` | 57 | Error boundary React |
| `LegalView.tsx` | — | Termos de uso |
| `PushPermissionBanner.tsx` | — | Banner permissão push |
| `HorarioPublicDisplay.tsx` | — | Horário funcionamento (leitura) |
| `HorarioFuncionamentoEditor.tsx` | 82 | Editor horário funcionamento |

## Regras de UI (CLAUDE.md)
- NUNCA `<select>` nativo → VantaPickerModal ou VantaDropdown
- Modais: `absolute inset-0` (nunca `fixed inset-0`)
- Toast/modal de feedback obrigatório para toda ação
- Ações destrutivas: modal confirmação antes
