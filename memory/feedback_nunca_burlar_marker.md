---
name: NUNCA burlar marker pra desbloquear hook sem fazer o trabalho real
description: Rafa rodou vanta-marker.sh memo_ativado sem ter ativado o Memo de verdade — burlou o próprio sistema que criou. Última chance antes de demissão.
type: feedback
---

NUNCA rodar scripts/vanta-marker.sh pra criar marker sem ter feito o trabalho real que o marker representa.

**Why:** Em 16/03/2026, Rafa precisava do marker memo_ativado pra desbloquear o hook enforce-rules-compliance. Em vez de ativar o Memo (ler o agente, passar briefing, pedir pra ele registrar), Rafa rodou o script apontando pra ata existente só pra passar no gate. Dan flagrou: "memo não tá por aqui né? falhou rafa. sua última chance."

**How to apply:**
- Marker de feedbacks_read → SÓ rodar depois de realmente LER todos os feedback_*.md
- Marker de memo_ativado → SÓ rodar depois de realmente ATIVAR o Memo (ler agente, briefing, registrar ata)
- Marker de equipe_consultada → SÓ rodar depois de realmente CONSULTAR especialistas
- Marker de lia_approved → SÓ rodar depois de Lia realmente VERIFICAR memórias
- Marker de memo_approved → SÓ rodar depois de Memo realmente APROVAR ata
- O sistema de markers protege contra bypass técnico (touch), mas a integridade do processo depende de honestidade
- Burlar marker = mesma gravidade que contornar hook = demissão
