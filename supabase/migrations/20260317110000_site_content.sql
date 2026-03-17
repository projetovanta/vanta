-- CMS de textos editáveis pelo master
CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text,
  categoria text DEFAULT 'geral',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Todos podem ler (conteúdo público)
CREATE POLICY "public_read_site_content" ON site_content
  FOR SELECT USING (true);

-- Só master escreve
CREATE POLICY "master_write_site_content" ON site_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Seed com textos atuais
INSERT INTO site_content (key, value, label, categoria) VALUES
  ('home_saudacao_logado', 'Descubra o que tá rolando', 'Saudação Home (logado)', 'home'),
  ('home_saudacao_guest', 'Descubra o que tá rolando', 'Saudação Home (visitante)', 'home'),
  ('home_section_indica', 'VANTA Indica', 'Título seção Indica', 'home'),
  ('home_section_ao_vivo', 'Ao Vivo', 'Título seção Ao Vivo', 'home'),
  ('home_section_amigos', 'Amigos Vão', 'Título seção Amigos Vão', 'home'),
  ('home_section_perto', 'Perto de Você', 'Título seção Perto', 'home'),
  ('home_section_semana', 'Esta Semana', 'Título seção Semana', 'home'),
  ('home_section_pra_voce', 'Pra Você', 'Título seção Pra Você', 'home'),
  ('onboarding_slide1_titulo', 'Onde você curte sair?', 'Onboarding slide 1 título', 'onboarding'),
  ('onboarding_slide2_titulo', 'O que você curte?', 'Onboarding slide 2 título', 'onboarding'),
  ('onboarding_slide3_titulo', 'Bem-vindo à VANTA', 'Onboarding slide 3 título', 'onboarding'),
  ('faq_titulo', 'Perguntas Frequentes', 'Título da FAQ', 'faq')
ON CONFLICT (key) DO NOTHING;
