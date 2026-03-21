# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — App do Usuário

## Estrutura
App.tsx → tabs (Home, Busca, Radar, Carteira, Perfil) + views modais (EventDetail, Chat, etc)

## Arquivos Principais
| Módulo | Arquivo | Linhas |
|---|---|---|
| Home/Feed | `components/Home/` | CitySelector, NotificationPanel |
| Busca | `modules/search/SearchView.tsx` | 369 |
| Radar (mapa) | `modules/radar/RadarView.tsx` | 310 |
| Carteira | `modules/wallet/WalletView.tsx` | 439 |
| Perfil | `modules/profile/ProfileView.tsx` | 717 |
| Evento | `modules/event-detail/EventDetailView.tsx` | 415 |
| Checkout | `modules/checkout/CheckoutPage.tsx` | 786 |
| Comunidade | `modules/community/ComunidadePublicView.tsx` | 407 |
| Chat | `modules/messages/MessagesView.tsx` (inbox) + `modules/messages/components/ChatRoomView.tsx` (1:1) | — |

## Stores usadas
- `useAuthStore` → conta, profile, notificações
- `useTicketsStore` → ingressos, presenças, cortesias pendentes
- `useExtrasStore` → eventos salvos, favoritos
- `useSocialStore` → amizades
- `useChatStore` → mensagens, online users

## Navegação
App.tsx controla `activeTab`, `activeView`, `selectedEvent`, etc via useState.
Componentes recebem callbacks (onBack, onEventClick, onMemberClick).
