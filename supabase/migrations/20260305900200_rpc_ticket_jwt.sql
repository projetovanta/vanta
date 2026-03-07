-- ══════════════════════════════════════════════════════════════════════════════
-- RPCs para sign/verify de QR codes de tickets
-- Secret fica APENAS no servidor (SECURITY DEFINER)
-- Substitui jwtService.ts que expunha VITE_JWT_SECRET no bundle
-- ══════════════════════════════════════════════════════════════════════════════

-- Usa pgcrypto para HMAC
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Secret: usa o JWT secret do próprio Supabase (app.settings.jwt_secret)
-- Disponível em toda instância Supabase via current_setting

-- ── sign_ticket_token ────────────────────────────────────────────────────────
-- Gera token HMAC-SHA256 com ticket_id + expiração de 15 segundos
CREATE OR REPLACE FUNCTION sign_ticket_token(p_ticket_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_header TEXT;
  v_payload TEXT;
  v_data TEXT;
  v_sig TEXT;
  v_exp BIGINT;
  v_iat BIGINT;
BEGIN
  -- Buscar o JWT secret do Supabase
  v_secret := current_setting('app.settings.jwt_secret', true);
  IF v_secret IS NULL OR v_secret = '' THEN
    RAISE EXCEPTION 'JWT secret not configured';
  END IF;

  v_iat := EXTRACT(EPOCH FROM now())::BIGINT;
  v_exp := v_iat + 15; -- 15 segundos

  -- Base64url encode header e payload
  v_header := replace(replace(rtrim(encode(convert_to('{"alg":"HS256","typ":"JWT"}', 'UTF8'), 'base64'), '='), '+', '-'), '/', '_');
  v_payload := replace(replace(rtrim(encode(convert_to('{"tid":"' || p_ticket_id || '","exp":' || v_exp || ',"iat":' || v_iat || '}', 'UTF8'), 'base64'), '='), '+', '-'), '/', '_');

  v_data := v_header || '.' || v_payload;

  -- HMAC-SHA256
  v_sig := replace(replace(rtrim(encode(hmac(v_data, v_secret, 'sha256'), 'base64'), '='), '+', '-'), '/', '_');

  RETURN v_data || '.' || v_sig;
END;
$$;

-- ── verify_ticket_token ──────────────────────────────────────────────────────
-- Verifica assinatura HMAC e expiração. Retorna ticket_id ou NULL.
CREATE OR REPLACE FUNCTION verify_ticket_token(p_token TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_secret TEXT;
  v_parts TEXT[];
  v_data TEXT;
  v_expected_sig TEXT;
  v_payload_json JSONB;
  v_payload_decoded TEXT;
  v_exp BIGINT;
  v_tid TEXT;
BEGIN
  v_secret := current_setting('app.settings.jwt_secret', true);
  IF v_secret IS NULL OR v_secret = '' THEN
    RETURN NULL;
  END IF;

  -- Split token
  v_parts := string_to_array(p_token, '.');
  IF array_length(v_parts, 1) != 3 THEN
    RETURN NULL;
  END IF;

  v_data := v_parts[1] || '.' || v_parts[2];

  -- Verify signature
  v_expected_sig := replace(replace(rtrim(encode(hmac(v_data, v_secret, 'sha256'), 'base64'), '='), '+', '-'), '/', '_');

  IF v_expected_sig != v_parts[3] THEN
    RETURN NULL;
  END IF;

  -- Decode payload (base64url → base64 → decode)
  v_payload_decoded := convert_from(
    decode(
      rpad(replace(replace(v_parts[2], '-', '+'), '_', '/'), 4 * ceil(length(v_parts[2]) / 4.0)::int, '='),
      'base64'
    ),
    'UTF8'
  );

  v_payload_json := v_payload_decoded::JSONB;
  v_exp := (v_payload_json->>'exp')::BIGINT;
  v_tid := v_payload_json->>'tid';

  -- Check expiration
  IF v_exp < EXTRACT(EPOCH FROM now())::BIGINT THEN
    RETURN NULL;
  END IF;

  RETURN v_tid;
END;
$$;

-- GRANTs
GRANT EXECUTE ON FUNCTION sign_ticket_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_ticket_token(TEXT) TO authenticated;
