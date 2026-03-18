# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 17:33
# Memória — Componentes Compartilhados

## Diretório: components/ (27 arquivos, 5518L)

## Principais
| Componente | Linhas | Função |
|---|---|---|
| ~~ConviteSocioModal~~ | — | REMOVIDO — negociação sócio fora do app |
| ~~NegociacaoSocioView~~ | — | REMOVIDO — negociação fora do app (decisão Dan) |
| `AuthModal.tsx` | 531 | Login/cadastro multi-step |
| `NotificationPanel.tsx` | 432 | Painel lateral notificações |
| `DevQuickLogin.tsx` | 356 | Login rápido dev — filtra profiles com auth.users, mostra role efetivo via RBAC, draggable |
| `AppModals.tsx` | 227 | Container de todos modais do app |
| `EventCard.tsx` | ~170 | Card de evento (imagem, nome, data, local, preço, tag estilo com backdrop-blur acima do título, prop `distLabel` pra distância ao lado do local) |
| `Toast.tsx` | — | Toast de feedback |
| `VantaPickerModal.tsx` | — | Picker modal customizado (substitui select nativo) |
| `VantaDropdown.tsx` | — | Dropdown customizado global |
| `ReviewModal.tsx` | — | Modal review de evento |
| `BottomSheet.tsx` | 38 | Wrapper bottom-sheet com safe-area + backdrop + pill handle + animação |
| `EmptyState.tsx` | 48 | Empty state reutilizável — ícone dourado + título + subtexto + CTA + variante compact |
| `Skeleton.tsx` | 84 | Shimmer: base + EventCard + TicketCard + Profile + PersonCard + ChatItem + HighlightCard |
| `BatchActionBar.tsx` | 65 | Barra de ações em lote — count + botões de ação + clear |
| `FilterBar.tsx` | 90 | Filtros avançados reutilizáveis — pills dropdown + badge count + limpar |
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
