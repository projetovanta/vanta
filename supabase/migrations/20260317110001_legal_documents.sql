-- Documentos legais editáveis (Termos de Uso, Privacidade, etc.)
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL, -- TERMOS_USO, POLITICA_PRIVACIDADE, TERMOS_MV
  versao integer NOT NULL DEFAULT 1,
  conteudo text NOT NULL DEFAULT '',
  publicado boolean DEFAULT false,
  publicado_em timestamptz,
  publicado_por uuid REFERENCES profiles(id),
  criado_em timestamptz DEFAULT now(),
  criado_por uuid REFERENCES profiles(id),
  UNIQUE(tipo, versao)
);

-- Consentimentos dos usuários
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  documento_tipo text NOT NULL,
  documento_versao integer NOT NULL,
  aceito_em timestamptz NOT NULL DEFAULT now(),
  ip_address text
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_tipo ON user_consents(documento_tipo);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Legal documents: todos leem publicados, master escreve
CREATE POLICY "public_read_legal" ON legal_documents
  FOR SELECT USING (publicado = true);

CREATE POLICY "master_all_legal" ON legal_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Consents: usuário lê os seus, sistema insere
CREATE POLICY "user_read_own_consents" ON user_consents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_insert_consent" ON user_consents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "master_read_consents" ON user_consents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Seed com versão 1 dos documentos atuais
INSERT INTO legal_documents (tipo, versao, conteudo, publicado, publicado_em) VALUES
  ('TERMOS_USO', 1, 'Termos de Uso da plataforma VANTA. Versão inicial.', true, now()),
  ('POLITICA_PRIVACIDADE', 1, 'Política de Privacidade da VANTA. Versão inicial.', true, now()),
  ('TERMOS_MV', 1, 'Termos do MAIS VANTA. Versão inicial.', true, now())
ON CONFLICT (tipo, versao) DO NOTHING;
