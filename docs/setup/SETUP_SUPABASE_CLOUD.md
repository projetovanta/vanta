# Setup Supabase Cloud — MAIS VANTA (100% Funcional)

**Tempo estimado**: 15 minutos

---

## ✅ PASSO 1: Criar Projeto Supabase Cloud (2 min)

1. Abrir https://supabase.com/dashboard
2. Clicar em **"New Project"**
3. Preencher:
   - **Name**: `prevanta-mais-vanta`
   - **Database Password**: `SenhaForte123!@#` (salvar em local seguro)
   - **Region**: `South America (São Paulo)` ← **IMPORTANTE**
4. Clicar **"Create new project"**
5. **Aguardar 2-3 minutos** até project estar ready (status verde)

---

## ✅ PASSO 2: Copiar Credenciais (1 min)

1. Em Supabase Dashboard, abrir seu projeto
2. Ir em **Settings → API** (left sidebar)
3. Copiar e salvar em `.env.local`:

```env
VITE_SUPABASE_URL=https://[seu-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-anon-key]
```

Exemplo:
```env
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ PASSO 3: Executar Migrations (5 min)

1. **Em Supabase Dashboard**, ir em **SQL Editor** (left sidebar)
2. Clicar em **"New Query"**
3. **Copiar todo o conteúdo** deste arquivo:
   ```bash
   pbcopy < /tmp/migrate_mais_vanta.sql
   ```
4. **Colar** no SQL Editor do Supabase
5. Clicar em **"Execute"** (ou Cmd+Enter)
6. **Aguardar conclusão** (deve terminar com "Success")

> ⚠️ Se houver erro, leia a mensagem — pode ser permissões ou sintaxe SQL.

---

## ✅ PASSO 4: Testar Conexão (2 min)

1. Terminal:
   ```bash
   cd /Users/vanta/prevanta
   npm run dev
   ```

2. Abrir http://localhost:5173

3. Verificar:
   - ✅ App carrega normalmente
   - ✅ Sidebar mostra "MAIS VANTA Hub"
   - ✅ Consegue navegar pra views MAIS VANTA

4. Se houver erro de conexão:
   - Verificar se `.env.local` tem as credenciais corretas
   - Checar se Supabase project está verde (ready)

---

## ✅ PASSO 5: Testar Fluxo End-to-End (3 min)

### Teste 1: Usuário Solicita Entrada
1. Fazer login como **usuário comum** (não admin)
2. Ir em **Perfil → Clube MAIS VANTA**
3. Clicar em **"Solicitar Entrada"**
4. Preencher:
   - Instagram handle: `@seu_instagram`
   - Seguidores: `10000`
5. Aceitar termos
6. Clicar **"Enviar Solicitação"**
7. Verificar mensagem: "Solicitação enviada!"

### Teste 2: Master Aprova
1. Fazer login como **admin/master**
2. Ir em **Portal → Curadoria → Aba "Clube"**
3. Ver solicitação do usuário anterior
4. Clicar **"Aprovar"**
5. Selecionar tier: **"Bronze"** (default)
6. Clicar **"Confirmar"**
7. Verificar: "Membro aprovado como Bronze"

### Teste 3: Usuário Vê Aprovação
1. Logout e fazer login como **usuário comum** novamente
2. Ir em **Perfil → Clube MAIS VANTA**
3. Verificar status: **"✅ Aprovado como Bronze"**

### Teste 4: Comunidade Assina Plano
1. Fazer login como **produtor/socio**
2. Ir em **Portal → Evento → criar novo ou editar**
3. Procurar por **"MAIS VANTA"** (ou botão pra ativar)
4. Ver modal com planos
5. Clicar em **"Assinar - Plano Básico"**
6. Verificar: "Assinatura criada com sucesso"

### Teste 5: Configurar Lotes
1. Na mesma tela de evento, ir em **"Lotes"**
2. Verificar se há seção **"MAIS VANTA por Tier"**
3. Clicar em tier (Bronze, Prata, Ouro, Diamante)
4. Definir:
   - Quantidade: `10`
   - Com acompanhante: ✅
5. Salvar evento
6. Verificar: "Evento salvo com sucesso"

---

## ✅ PASSO 6: Configurar Notificações (Firebase) — OPCIONAL

Se quiser testar notificações automáticas:

1. Criar conta Firebase (https://console.firebase.google.com)
2. Criar novo projeto
3. Em **Project Settings → Service Accounts**
4. Clicar em **"Generate New Private Key"**
5. Copiar JSON
6. Em Supabase Dashboard → **Settings → Secrets**
7. Adicionar 3 secrets:
   - `FIREBASE_PROJECT_ID` = seu project ID
   - `FIREBASE_CLIENT_EMAIL` = email do service account
   - `FIREBASE_PRIVATE_KEY` = chave privada (com `\n` escapado)

---

## ✅ PASSO 7: Registrar Cron Jobs — OPCIONAL

Se Firebase está configurado e quer notificações automáticas:

1. Em Supabase Dashboard → **SQL Editor**
2. Criar nova query com:

```sql
-- Notificação evento iniciou (5 min)
SELECT cron.schedule(
  'notif-evento-iniciou',
  '*/5 * * * *',
  $$SELECT net.http_post('https://[seu-project-id].supabase.co/functions/v1/notif-evento-iniciou')$$
);

-- Notificação evento finalizou (10 min)
SELECT cron.schedule(
  'notif-evento-finalizou',
  '*/10 * * * *',
  $$SELECT net.http_post('https://[seu-project-id].supabase.co/functions/v1/notif-evento-finalizou')$$
);

-- Registrar infrações (1x/dia 03:00 UTC)
SELECT cron.schedule(
  'notif-infraccao-registrada',
  '0 3 * * *',
  $$SELECT net.http_post('https://[seu-project-id].supabase.co/functions/v1/notif-infraccao-registrada')$$
);
```

Substituir `[seu-project-id]` pela URL do seu projeto.

---

## 🎯 Checklist Final

- [ ] Supabase Cloud project criado
- [ ] `.env.local` atualizado com credenciais
- [ ] Migrations executadas com sucesso
- [ ] App local carrega normalmente
- [ ] Teste 1: Usuário solicita entrada ✅
- [ ] Teste 2: Master aprova ✅
- [ ] Teste 3: Usuário vê aprovação ✅
- [ ] Teste 4: Comunidade assina plano ✅
- [ ] Teste 5: Lotes configurados ✅
- [ ] Firebase + Cron jobs configurados (opcional)

---

## 🚀 Próximos Passos

Após completar este setup:

1. **Meta API** (opcional): Configurar `META_ACCESS_TOKEN` em Supabase Secrets
2. **Testar completo**: Fluxo do usuário → post → verificação → infração
3. **Deploy**: Preparar para produção (Vercel + Supabase)

---

**Dúvidas?** Verificar logs em Supabase Dashboard → **Logs** (realtime errors)
