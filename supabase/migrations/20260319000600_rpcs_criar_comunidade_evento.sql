-- Fix C8: RPCs que existem no banco mas não tinham migration
-- Extraídas via pg_get_functiondef do banco de produção em 2026-03-18

-- ════════════════════════════════════════════════════════
-- RPC: criar_comunidade_completa
-- ════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.criar_comunidade_completa(p_comunidade jsonb, p_produtores uuid[] DEFAULT ARRAY[]::uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_comunidade_id UUID;
  v_user_id UUID;
  v_slug TEXT;
  v_slug_base TEXT;
  v_slug_count INT;
  v_produtor_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Gerar slug
  v_slug_base := lower(regexp_replace(
    regexp_replace(p_comunidade->>'nome', '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  v_slug := v_slug_base;
  v_slug_count := 0;

  -- Resolver colisão de slug
  WHILE EXISTS (SELECT 1 FROM comunidades WHERE slug = v_slug) LOOP
    v_slug_count := v_slug_count + 1;
    v_slug := v_slug_base || '-' || v_slug_count;
  END LOOP;

  -- 1. INSERT comunidade
  INSERT INTO comunidades (
    nome, descricao, cidade, estado, cep, endereco,
    foto, foto_capa, coords, capacidade_max,
    horario_funcionamento, slug,
    created_by, dono_id,
    cnpj, razao_social, telefone,
    instagram, whatsapp, tiktok, site,
    vanta_fee_percent, taxa_processamento_percent, taxa_porta_percent,
    taxa_minima, cota_nomes_lista, taxa_nome_excedente,
    cota_cortesias, taxa_cortesia_excedente_pct,
    tipo_comunidade
  ) VALUES (
    p_comunidade->>'nome',
    p_comunidade->>'descricao',
    p_comunidade->>'cidade',
    p_comunidade->>'estado',
    p_comunidade->>'cep',
    p_comunidade->>'endereco',
    COALESCE(p_comunidade->>'foto', ''),
    COALESCE(p_comunidade->>'foto_capa', ''),
    (p_comunidade->'coords')::jsonb,
    (p_comunidade->>'capacidade_max')::int,
    COALESCE((p_comunidade->'horario_funcionamento')::jsonb, '[]'::jsonb),
    v_slug,
    v_user_id,
    v_user_id,
    p_comunidade->>'cnpj',
    p_comunidade->>'razao_social',
    p_comunidade->>'telefone',
    p_comunidade->>'instagram',
    p_comunidade->>'whatsapp',
    p_comunidade->>'tiktok',
    p_comunidade->>'site',
    (p_comunidade->>'vanta_fee_percent')::numeric,
    (p_comunidade->>'taxa_processamento_percent')::numeric,
    (p_comunidade->>'taxa_porta_percent')::numeric,
    (p_comunidade->>'taxa_minima')::numeric,
    (p_comunidade->>'cota_nomes_lista')::int,
    (p_comunidade->>'taxa_nome_excedente')::numeric,
    (p_comunidade->>'cota_cortesias')::int,
    (p_comunidade->>'taxa_cortesia_excedente_pct')::numeric,
    COALESCE(p_comunidade->>'tipo_comunidade', 'ESPACO_FIXO')
  )
  RETURNING id INTO v_comunidade_id;

  -- 2. RBAC para cada produtor como GERENTE
  FOREACH v_produtor_id IN ARRAY p_produtores LOOP
    INSERT INTO atribuicoes_rbac (user_id, tenant_type, tenant_id, cargo, permissoes, atribuido_por, ativo)
    VALUES (
      v_produtor_id, 'COMUNIDADE', v_comunidade_id, 'GERENTE',
      ARRAY['VER_FINANCEIRO','GERIR_EQUIPE','GERIR_LISTAS','INSERIR_LISTA','CRIAR_REGRA_LISTA','EMITIR_CORTESIAS','CHECKIN_LISTA','VALIDAR_QR','EDITAR_COMUNIDADE'],
      v_user_id, true
    )
    ON CONFLICT (user_id, tenant_type, tenant_id, cargo) DO NOTHING;
  END LOOP;

  RETURN jsonb_build_object('comunidade_id', v_comunidade_id, 'slug', v_slug, 'success', true);
END;
$function$;


-- ════════════════════════════════════════════════════════
-- RPC: criar_evento_completo
-- ════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.criar_evento_completo(p_evento jsonb, p_lotes jsonb DEFAULT '[]'::jsonb, p_equipe jsonb DEFAULT '[]'::jsonb, p_socios jsonb DEFAULT '[]'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_evento_id UUID;
  v_lote_id UUID;
  v_lote JSONB;
  v_var JSONB;
  v_membro JSONB;
  v_socio JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- 1. INSERT evento
  INSERT INTO eventos_admin (
    nome, descricao, foto, data_inicio, data_fim,
    comunidade_id, local_nome, endereco, cidade, coords,
    formato, estilos, experiencias,
    status_evento, publicado, created_by,
    tipo_fluxo, classificacao_etaria,
    vanta_fee_percent, taxa_processamento_percent, taxa_porta_percent,
    taxa_minima, cota_nomes_lista, taxa_nome_excedente,
    cota_cortesias, taxa_cortesia_excedente_pct,
    gateway_fee_mode, recorrencia, recorrencia_ate
  ) VALUES (
    p_evento->>'nome',
    p_evento->>'descricao',
    p_evento->>'foto',
    (p_evento->>'data_inicio')::timestamptz,
    (p_evento->>'data_fim')::timestamptz,
    (p_evento->>'comunidade_id')::uuid,
    p_evento->>'local_nome',
    p_evento->>'endereco',
    p_evento->>'cidade',
    (p_evento->'coords')::jsonb,
    p_evento->>'formato',
    CASE WHEN p_evento->'estilos' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(p_evento->'estilos')) ELSE NULL END,
    CASE WHEN p_evento->'experiencias' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(p_evento->'experiencias')) ELSE NULL END,
    COALESCE(p_evento->>'status_evento', 'PENDENTE'),
    false,
    v_user_id,
    p_evento->>'tipo_fluxo',
    COALESCE(p_evento->>'classificacao_etaria', 'LIVRE'),
    (p_evento->>'vanta_fee_percent')::numeric,
    (p_evento->>'taxa_processamento_percent')::numeric,
    (p_evento->>'taxa_porta_percent')::numeric,
    (p_evento->>'taxa_minima')::numeric,
    (p_evento->>'cota_nomes_lista')::int,
    (p_evento->>'taxa_nome_excedente')::numeric,
    (p_evento->>'cota_cortesias')::int,
    (p_evento->>'taxa_cortesia_excedente_pct')::numeric,
    COALESCE(p_evento->>'gateway_fee_mode', 'REPASSAR'),
    p_evento->>'recorrencia',
    (p_evento->>'recorrencia_ate')::timestamptz
  )
  RETURNING id INTO v_evento_id;

  -- 2. INSERT sócios
  FOR v_socio IN SELECT * FROM jsonb_array_elements(p_socios) LOOP
    INSERT INTO socios_evento (evento_id, socio_id, split_percentual, permissoes, status)
    VALUES (
      v_evento_id,
      (v_socio->>'socio_id')::uuid,
      (v_socio->>'split_percentual')::int,
      CASE WHEN v_socio->'permissoes' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(v_socio->'permissoes')) ELSE ARRAY[]::text[] END,
      'PENDENTE'
    );
  END LOOP;

  -- 3. INSERT lotes + variações
  FOR v_lote IN SELECT * FROM jsonb_array_elements(p_lotes) LOOP
    INSERT INTO lotes (evento_id, nome, ordem, data_validade, ativo)
    VALUES (
      v_evento_id,
      v_lote->>'nome',
      COALESCE((v_lote->>'ordem')::int, 1),
      (v_lote->>'data_validade')::timestamptz,
      true
    )
    RETURNING id INTO v_lote_id;

    IF v_lote->'variacoes' IS NOT NULL THEN
      FOR v_var IN SELECT * FROM jsonb_array_elements(v_lote->'variacoes') LOOP
        INSERT INTO variacoes_ingresso (lote_id, area, area_custom, genero, valor, limite, requer_comprovante, tipo_comprovante)
        VALUES (
          v_lote_id,
          COALESCE(v_var->>'area', 'PISTA'),
          v_var->>'area_custom',
          COALESCE(v_var->>'genero', 'UNISEX'),
          COALESCE((v_var->>'valor')::numeric, 0),
          COALESCE((v_var->>'limite')::int, 100),
          COALESCE((v_var->>'requer_comprovante')::boolean, false),
          v_var->>'tipo_comprovante'
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 4. INSERT equipe
  FOR v_membro IN SELECT * FROM jsonb_array_elements(p_equipe) LOOP
    INSERT INTO equipe_evento (evento_id, membro_id, papel, liberar_lista, permissoes)
    VALUES (
      v_evento_id,
      (v_membro->>'membro_id')::uuid,
      COALESCE(v_membro->>'papel', 'promoter'),
      COALESCE((v_membro->>'liberar_lista')::boolean, false),
      CASE WHEN v_membro->'permissoes' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(v_membro->'permissoes')) ELSE ARRAY[]::text[] END
    );
  END LOOP;

  -- 5. RBAC para o criador
  INSERT INTO atribuicoes_rbac (user_id, tenant_type, tenant_id, cargo, permissoes, atribuido_por, ativo)
  VALUES (v_user_id, 'EVENTO', v_evento_id, 'SOCIO',
    ARRAY['VER_FINANCEIRO','GERIR_EQUIPE','GERIR_LISTAS','INSERIR_LISTA','CRIAR_REGRA_LISTA','EMITIR_CORTESIAS','CHECKIN_LISTA','VALIDAR_QR'],
    v_user_id, true
  )
  ON CONFLICT (user_id, tenant_type, tenant_id, cargo) DO NOTHING;

  RETURN jsonb_build_object('evento_id', v_evento_id, 'success', true);
END;
$function$;
