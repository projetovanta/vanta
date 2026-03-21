---
name: CMS Master — Central de Configurações
description: Ideia de painel onde o masteradm edita tudo no app sem código (textos, categorias, regras, visual). Ainda não planejado.
type: project
---

## Status: IDEIA — ainda não planejado nem aprovado

Dan quer um dia ter um painel CMS interno onde o master admin controla tudo que é editável sem precisar de deploy/código.

## Áreas cogitadas
- Categorias & listas (formatos, estilos, experiências, interesses)
- Textos e labels do app
- Documentos legais (editor rico)
- Regras e limites (taxas, prazos, máximos)
- Seções da Home (ordem, visibilidade, título)
- Cores do app (destaque + primária)
- Templates de notificação push
- Campos de formulários (obrigatório/opcional + ordem)
- Interesses do onboarding (CRUD + agrupamento por categoria)

## Decisões preliminares
- Acesso: só masteradm
- Publicação: tempo real (salvou → aparece)
- Histórico: com botão de desfazer

## O que JÁ existe no banco (base pra expandir)
- `platform_config` — taxas (4 key/value)
- `legal_documents` — termos versionados
- `push_templates` — templates de push
- `formatos`, `estilos`, `experiencias`, `categorias_evento` — lookups
- `splits_config`, `clube_config`, `mais_vanta_config` — configs específicas

## O que está hardcoded (precisaria migrar)
- Limites: MAX_PHOTOS, LIMITE_REEMBOLSOS_MES, MAX_VISIBLE, etc.
- Taxas: TAXA_VANTA_PERCENT no analytics
- Categorias de parceiro em 2 views
- Textos do app: tudo inline (sem i18n)
- Seções da Home: ordem hardcoded

**Why:** Dan quer autonomia total pra ajustar o app sem depender de código/deploy.
**How to apply:** Quando for retomado, usar este arquivo como ponto de partida. Não iniciar sem aprovação explícita do Dan.
