# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — MAIS VANTA (Clube de Influência)

## Diretório: features/admin/services/clube/

## Fachada
`clube/index.ts` (220L) → `clubeService` — re-exporta todos sub-services

## Sub-Services
| Service | Linhas | Função |
|---|---|---|
| `clubeCache.ts` | 144 | Cache local (tiers, membros, lotes, reservas, solicitações) |
| `clubeMembrosService.ts` | 55 | CRUD membros, verificar tier |
| `clubeTiersService.ts` | 72 | Definição tiers (BRONZE→DIAMANTE) |
| `clubeSolicitacoesService.ts` | 296 | Solicitações de entrada + aprovação |
| `clubeLotesService.ts` | 125 | Lotes exclusivos por tier/evento |
| `clubeReservasService.ts` | 114 | Reservas de benefícios por evento |
| `clubeInfracoesService.ts` | 148 | Bloqueios, bans, castigos, dívida social |
| `clubePassportService.ts` | 135 | Passport regional (aprovação por cidade) |
| `clubeInstagramService.ts` | 92 | Verificação post Instagram |
| `clubeConfigService.ts` | 39 | Configuração do programa |

## Outros
| Arquivo | Linhas | Função |
|---|---|---|
| `assinaturaService.ts` | 401 | Planos MV, assinaturas, cotas |
| `maisVantaConfigService.ts` | 153 | Config global (menções, hashtags, prazos) |
| `modules/profile/ClubeOptInView.tsx` | 280 | Tela opt-in para usuário |

## Tiers (ordem crescente)
BRONZE → PRATA → OURO → DIAMANTE

## Fluxo
1. User solicita entrada (ClubeOptInView)
2. Admin aprova/rejeita (clubeSolicitacoesService)
3. Membro ativo → benefícios (lotes exclusivos, reservas)
4. Post Instagram obrigatório → verificação
5. Infrações → bloqueio progressivo → ban
