# Hook: Checagem de Memória Pré-Commit

> Este hook é acionado ANTES de todo commit. É a Lia (Guardiã de Memória) fazendo a verificação final.

## Quando ativar

Sempre que o Claude Code for executar `git commit`, ANTES de commitar, executar esta checagem:

## O que fazer

1. **Listar arquivos alterados:**
   ```bash
   git diff --cached --name-only
   ```

2. **Mapear áreas afetadas:**
   - Arquivos em `src/modules/` → qual módulo?
   - Arquivos em `src/components/` → componentes compartilhados
   - Arquivos em `supabase/` → banco de dados
   - Arquivos em `src/services/` → lógica de negócio
   - Arquivos em `supabase/functions/` → Edge Functions

3. **Verificar memórias correspondentes:**
   - O `modulo_*.md` da área alterada foi atualizado neste commit?
   - `.agents/MEMORIA-COMPARTILHADA.md` reflete as mudanças?
   - `memory/MEMORY.md` está coerente?
   - Se mudou fluxo de telas → `MAPA_PROJETO.md` atualizado?
   - Se mudou conexão entre módulos → `EDGES.md` atualizado?

4. **Resultado:**

   **Se tudo OK:**
   ```
   ✅ Lia: Memórias conferidas. Pode commitar.
   — Lia, Guardiã de Memória
   ```

   **Se falta algo:**
   ```
   ❌ Lia: COMMIT BLOQUEADO — Memórias desatualizadas:

   - [arquivo de memória] → [o que falta]
   - [arquivo de memória] → [o que falta]

   Alex, manda a equipe atualizar antes de commitar.
   — Lia, Guardiã de Memória
   ```

   Nesse caso, Alex IMEDIATAMENTE coordena a atualização e só depois permite o commit.

## Regras

- NUNCA pular esta checagem
- NUNCA commitar com memórias desatualizadas
- Se Dan pedir pra commitar mesmo assim → avisar do risco e pedir confirmação explícita
- Após atualização das memórias → rodar a checagem novamente antes de commitar
