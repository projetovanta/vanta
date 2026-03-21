# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Mapa — Features Extras

## Clube MAIS VANTA
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/services/clube/index.ts` | 220 | Fachada clubeService |
| `features/admin/services/clube/clubeCache.ts` | 144 | Cache local (tiers, membros, lotes, reservas) |
| `features/admin/services/clube/clubeMembrosService.ts` | 55 | CRUD membros clube |
| `features/admin/services/clube/clubeTiersService.ts` | 72 | Tiers (BRONZE→DIAMANTE) |
| `features/admin/services/clube/clubeSolicitacoesService.ts` | 296 | Solicitações de entrada |
| `features/admin/services/clube/clubeLotesService.ts` | 125 | Lotes exclusivos por tier |
| `features/admin/services/clube/clubeReservasService.ts` | 114 | Reservas de benefícios |
| `features/admin/services/clube/clubeInfracoesService.ts` | 148 | Bloqueios, bans, castigos |
| `features/admin/services/clube/clubePassportService.ts` | 135 | Passport regional |
| `features/admin/services/clube/clubeInstagramService.ts` | 92 | Verificação Instagram |
| `features/admin/services/clube/clubeConfigService.ts` | 39 | Config do programa |
| `modules/profile/ClubeOptInView.tsx` | 280 | Tela opt-in do clube |

## Campanhas
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/services/campanhasService.ts` | 282 | Envio in-app/push/email por segmento |

## Cupons
| Arquivo | Linhas | Função |
|---|---|---|
| `features/admin/services/cuponsService.ts` | 116 | CRUD cupons de desconto |

## Favoritos
| Arquivo | Linhas | Função |
|---|---|---|
| `services/favoritosService.ts` | 30 | Salvar/remover eventos favoritos |

## Push / FCM
| Arquivo | Linhas | Função |
|---|---|---|
| `services/pushService.ts` | 78 | Registro token FCM |
| `services/firebaseConfig.ts` | 46 | Config Firebase |
| `features/admin/services/notificationsService.ts` | 124 | Criar notificações in-app |
