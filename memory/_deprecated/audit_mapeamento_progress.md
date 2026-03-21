# Tracking — Mapeamento Completo PREVANTA

## Estado
- 9 arquivos de mapeamento (M1-M9) — TODOS COMPLETOS
- 132 fluxos mapeados no total
- 0 fluxos com status VERIFICAR (todos resolvidos)
- Revisao detalhada com usuario: Passos 1-2 (parcial)

## Revisao com usuario (onde parou)
- Passo 1 (Comunidade): todos sub-fluxos OK ✓
- Passo 2 (Criar evento):
  - F5.1 Step1Evento: OK ✓
  - F5.1 Step2Ingressos: OK ✓
  - F5.1 Step3Listas: OK ✓ (anotou receita de listas pagas)
  - F5.1 Step4EquipeCasa: OK ✓
  - F5.1 Step4EquipeSocio: OK ✓ (observacao VER_FINANCEIRO vs split)
  - F5.1 Step5Financeiro: OK ✓
  - F5.2 Editar evento: OK ✓
  - F5.3 Copiar evento: PENDENTE (usuario pediu anotar)
  - F5.6 Lotes CRUD: OK ✓
  - F5.7 Listas CRUD: parou aqui
- Faltam: F5.11 Cupons, F9.6 Convite Socio, F4.15 Mesas compra, Passos 3-8

## Pendencias encontradas
- F6.1: receita de listas pagas NAO entra no FinanceiroView (saque/saldoConsolidado)
- F5.3: Copiar evento — PENDENTE
- Step4 Socio: observacao menor (VER_FINANCEIRO vs split)
- Capacidade: vem da comunidade — usuario confirmou suficiente

## Verificacoes anteriores
- F3.4 Excluir conta: soft delete em ProfileView — OK
- F3.14 Preferencias: NAO EXISTE
- F4.8 Waitlist: trigger manual via reembolso/cancel — OK
- F4.15 Mesas: admin OK, compra usuario nao verificado
- F5.9 Promoter cotas: somente leitura + export — OK
- F5.15 Caixa fechamento: UPDATE status=FINALIZADO — OK
- F7.2 Categorias: 4 tabelas, supabase direto — OK
- F7.5 Definir Cargos: rbacService completo — OK
- F7.10 Comprovantes: comprovanteService completo — OK
