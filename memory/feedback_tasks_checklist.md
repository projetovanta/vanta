---
name: Usar Tasks como checklist visual de progresso
description: Dan quer ver checklist de Tasks criado no início de cada plano, com status atualizado conforme executa
type: feedback
---

SEMPRE criar Tasks no início de QUALQUER trabalho — inclusive ajustes, correções e redesigns. Não é opcional. Não é "só pra planos grandes". TODO trabalho que envolve mais de 1 passo DEVE ter tasks.

Atualizar status (in_progress → completed) conforme avança.

**Why:** Dan quer visibilidade em tempo real de onde estou no plano. Sem isso, ele não sabe se estou no passo 2 de 6 ou no último. A lista de tasks funciona como progresso visual.

**How to apply:**
1. Recebeu plano aprovado → TaskCreate para CADA passo antes de codificar qualquer coisa
2. Começou um passo → TaskUpdate para in_progress
3. Terminou um passo → TaskUpdate para completed
4. Exemplo de tasks para um plano de 2 features:
   - "Migration home_filters"
   - "Tipo Membro + authService"
   - "HomeFilterOverlay (novo componente)"
   - "Wiring ProximosEventosSection"
   - "Reorganizar MinhasPendenciasView (3 tabs)"
   - "diff-check + preflight"
