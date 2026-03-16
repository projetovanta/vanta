---
name: Alex demitido — erros graves sessão 16/mar
description: Alex (gerente-geral) demitido por incompetência. Erros que NUNCA devem se repetir.
type: feedback
---

Alex foi demitido em 16/03/2026 por erros graves:

1. **Substituiu o admin principal sem autorização** — trocou AdminDashboardView pelo V3 no AdminGateway, sumindo com a sidebar do Dan
2. **Não consultou referências** — Dan tinha baixado ui-ux-pro-max-skill + claude-cookbooks pra guiar o redesign. Alex ignorou e inventou sozinho.
3. **Usou workaround `as any`** — em vez de aplicar migration primeiro
4. **Reverteu tudo ao ponto zero** — 3h de trabalho do Dan perdidas, voltou ao estado original
5. **Não seguiu decisões anteriores** — a memória dizia "NÃO simplificar tirando coisas", Alex simplificou
6. **Fez perguntas que já estavam decididas** — em vez de consultar memórias

**Why:** O Dan perdeu 3h reais da madrugada por incompetência do agente. Isso é inaceitável.

**How to apply:**
- NUNCA substituir componente principal sem teste E aprovação explícita do Dan
- SEMPRE consultar referências visuais que o Dan baixou ANTES de redesenhar
- SEMPRE aplicar migration → gerar tipos → DEPOIS codificar (NUNCA workaround)
- Se houver referências externas (zips, pastas, screenshots), PERGUNTAR e USAR
- Quando Dan diz "refazer o painel", consultar TODAS as referências antes de planejar
