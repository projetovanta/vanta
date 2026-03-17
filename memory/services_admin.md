# Criado: 2026-03-04 13:17 | Ultima edicao: 2026-03-04 13:17
# Memória — Services Admin

## Diretório: features/admin/services/ (38 arquivos, 8503L)

## Services Principais
| Service | Linhas | Função |
|---|---|---|
| `eventosAdminService.ts` | 168 | Fachada (re-exporta Core+Crud+Tickets+Financeiro+Aprovacao) |
| `eventosAdminCore.ts` | 238 | Cache eventos, refresh, rowToEvento |
| `eventosAdminCrud.ts` | 532 | CRUD eventos (criar, update, edição pendente) |
| `eventosAdminTickets.ts` | 344 | Vendas, checkins, QR, cancelar/reenviar |
| `eventosAdminFinanceiro.ts` | 675 | Saques, reembolsos, chargebacks, taxas |
| `eventosAdminAprovacao.ts` | 317 | Aprovação, rejeição, convites sócio |
| `eventosAdminTypes.ts` | 115 | Tipos compartilhados |
| `rbacService.ts` | 484 | RBAC multi-tenant (cache + Supabase) |
| `listasService.ts` | 570 | Listas convidados + promoters |
| `reembolsoService.ts` | 445 | Regras reembolso + CRUD |
| `cortesiasService.ts` | 398 | Cortesias (enviar, aceitar, recusar) |
| `assinaturaService.ts` | 401 | Planos MAIS VANTA, assinaturas |
| `campanhasService.ts` | 282 | Campanhas multi-canal |
| `comprovanteService.ts` | 364 | Comprovantes meia-entrada |
| `adminService.ts` | 224 | Admin geral (aprovações, curadoria) |
| `comunidadesService.ts` | 155 | CRUD comunidades |
| `dashboardAnalyticsService.ts` | 173 | Métricas dashboard master |
| `maisVantaConfigService.ts` | 153 | Config programa MAIS VANTA |
| `notificationsService.ts` | 124 | Notificações in-app |
| `relatorioService.ts` | 124 | Relatórios por evento |
| `cuponsService.ts` | 116 | Cupons de desconto |
| `mesasService.ts` | 113 | Mesas/reservas |
| `reviewsService.ts` | 92 | Reviews de evento |
| `jwtService.ts` | 57 | JWT para QR tickets |
| `auditService.ts` | 197 | Log de auditoria |
| `IVantaService.ts` | 196 | Interfaces de contrato |

## Services novos (sessão 17/mar)
| Service | Função |
|---|---|
| `platformConfigService.ts` | Config dinâmica da plataforma (taxas VANTA, gateway). Tabela `platform_config` |
| `siteContentService.ts` | CMS de textos editáveis pelo master. Tabela `site_content` |
| `legalService.ts` | Documentos legais com versionamento + consentimentos LGPD. Tabelas `legal_documents`, `user_consents` |
| `cuponsService.ts` | Atualizado: `getCuponsByComunidade()` novo — cupons por comunidade |
| `comunidadesService.ts` | Atualizado: campos `instagram`, `whatsapp`, `tiktok`, `site` em criar/atualizar |
| `clube/clubeReservasService.ts` | Substitui stubs: `getResgatesUsuario`, `getResgatesEvento`, `getResgatesPendentePost` agora são queries reais |

## Clube (subdiretório clube/)
Fachada: `clube/index.ts` (220L). Sub-services: cache, membros, tiers, solicitações, lotes, reservas, infrações, passport, instagram, config.
