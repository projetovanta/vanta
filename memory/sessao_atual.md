# Sessao Atual — Estado para Continuidade

## Branch: visual-redesign
## Ultimo commit: sessão 15 — sidebar admin reorganizada
## TSC: 0 erros
## Diff-check: OK

## O que foi feito na sessao 15 (20 mar 2026)

### Feature: Reorganização da Sidebar do Painel Admin
- Sidebar reescrita de 6 seções técnicas → 6 seções por contexto de uso
- Antes: GERAL, GESTÃO, FINANCEIRO, MAIS VANTA, MARKETING, SISTEMA
- Agora: VISÃO GERAL, COMUNIDADES, EVENTOS, FINANCEIRO, MAIS VANTA, PLATAFORMA
- Seções MARKETING e GESTÃO eliminadas (itens redistribuídos por contexto)
- Config Plataforma renomeado → "Taxas e Splits"
- Termos e Privacidade renomeado → "Legal"
- DiagnosticoView: hub com 4 abas (Saúde, Analytics, FAQ, Ferramentas)
- Itens absorvidos pelo Diagnóstico: Product Analytics, FAQ, Links Úteis, Pendências App
- Painel Master removido da sidebar (Dashboard já mostra KPIs)
- SidebarV2 + AdminSidebar + DashboardV2Gateway + DiagnosticoView alterados
- Community sidebar NÃO foi alterada

### Pendência da sessão 15
- Dan quer mais do que reorganização da sidebar — quer páginas-hub contextuais
- Na próxima sessão: Dan vai explicar exatamente o que quer

## Decisoes do Dan ativas (sessão 14)
- Filtro ⚙ = VOLÁTIL (estado local, reseta ao sair)
- Próximos Eventos mostra TUDO sempre (sem filtro persistente)
- Indica pra Você = posição 2 (logo após Próximos Eventos)
- Indica usa interesses do perfil (onboarding), NÃO o filtro ⚙
- Filtros ativos substituem chips (não coexistem)
- Tags removíveis com X + botão (+N filtros)
- Admin: página única com seções + etiquetas de uso
- Interesses = só genuínos (sem duplicar formatos/estilos)

## Decisoes do Dan ativas (sessão 13)
- 26 tipos de espaço como formatos únicos
- 39 estilos musicais ativos
- Cada comunidade só cria evento do seu próprio tipo
- PRODUTORA = todos os formatos
- IndicaPraVoce = inteligência automática (não filtro manual)
- Tasks: SEMPRE montar checklist visual

## Decisoes do Dan ativas (anteriores)
- Preço: Inter Bold, centralizado
- Badges estilo: fundo 400/50 + texto 100 + sombra
- EventCard: sem social proof, aspect 4/5
- Fonte: Playfair Display Bold 700
- Responsividade: mínimo 360px, máximo 500px

## 🔴 DELETAR ANTES DO LANÇAMENTO — Eventos de teste
- Função `atualizar_eventos_teste()` + pg_cron
- Eventos TESTE: IDs 101c9086, 4f7215b7, 1fad4f03, f6fb4b70
- Eventos seed: IDs b1000001-b1000009, c2000001-c2000018

## Pendências técnicas ativas
- C5/C6/C7 — credenciais .env
- C17-C20 — mobile (Apple/Google)
- A2 — CORS *
- A5 — N+1 queries financeiro
- A22 — 160 hover: em views mobile
- A27 — lazy load ExcelJS/jsPDF
- Integrar user_behavior com Indica pra Você (registrar cliques, alimentar recomendações)
- Visual dos chips: Dan quer mais contexto/provas de uso antes de decidir

## Pendencias externas
- Conta Apple Developer ($99/ano)
- Conta Google Play Console ($25)
- CNPJ + emails legais
