-- Migration: Formato / Estilo / Experiência — substitui categorias_evento
-- 3 tabelas independentes + novos campos em eventos_admin

-- ═══════════════════════════════════════════════════════════════════
-- FORMATOS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.formatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.formatos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON public.formatos FOR SELECT USING (true);
CREATE POLICY "master_write" ON public.formatos FOR ALL USING (true);

INSERT INTO public.formatos (label, ordem) VALUES
  ('Boate / Nightclub', 0),
  ('Rooftop', 1),
  ('Beach Club', 2),
  ('Festival', 3),
  ('Show (Live Performance)', 4),
  ('Bar / Pub', 5),
  ('Galpão / Warehouse', 6),
  ('Open Air', 7),
  ('Pool Party', 8),
  ('Sunset Event', 9),
  ('Evento Universitário', 10),
  ('Evento Premium / Lounge', 11),
  ('Evento Temático', 12),
  ('Evento Gastronômico Noturno', 13),
  ('After Party', 14),
  ('Casa de Shows', 15),
  ('Arena / Estádio', 16),
  ('Teatro', 17),
  ('Espaço Cultural', 18),
  ('Mansão / Villa', 19),
  ('Iate / Barco', 20),
  ('Hotel / Resort', 21),
  ('Restaurante', 22),
  ('Clube Social', 23),
  ('Parque', 24),
  ('Praça Pública', 25),
  ('Praia', 26),
  ('Centro de Convenções', 27),
  ('Fazenda / Sítio', 28),
  ('Loft / Espaço Privativo', 29)
ON CONFLICT (label) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- ESTILOS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.estilos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.estilos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON public.estilos FOR SELECT USING (true);
CREATE POLICY "master_write" ON public.estilos FOR ALL USING (true);

INSERT INTO public.estilos (label, ordem) VALUES
  ('Funk', 0),
  ('Eletrônica (EDM)', 1),
  ('Techno', 2),
  ('House', 3),
  ('Afro House', 4),
  ('Progressive', 5),
  ('Open Format', 6),
  ('Trap', 7),
  ('Hip Hop', 8),
  ('Pop', 9),
  ('Anos 2000', 10),
  ('Samba', 11),
  ('Pagode', 12),
  ('Sertanejo', 13),
  ('Rock / Indie', 14),
  ('MPB', 15),
  ('Reggaeton', 16),
  ('Dancehall', 17),
  ('Latin Music', 18),
  ('R&B', 19),
  ('Gospel', 20),
  ('Forró', 21),
  ('Axé', 22),
  ('Brega Funk', 23),
  ('Hard Techno', 24),
  ('Psytrance', 25),
  ('Drum & Bass', 26),
  ('Jazz', 27),
  ('Blues', 28),
  ('Clássico / Orquestra', 29)
ON CONFLICT (label) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- EXPERIÊNCIAS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.experiencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.experiencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON public.experiencias FOR SELECT USING (true);
CREATE POLICY "master_write" ON public.experiencias FOR ALL USING (true);

INSERT INTO public.experiencias (label, ordem) VALUES
  ('Open Bar', 0),
  ('Open Food', 1),
  ('VIP Area', 2),
  ('Área Backstage', 3),
  ('Sunset', 4),
  ('After', 5),
  ('Day Party', 6),
  ('Black Tie', 7),
  ('Festa à Fantasia', 8),
  ('White Party', 9),
  ('Pool Experience', 10),
  ('Open Air', 11),
  ('Por Convite', 12),
  ('Members Only', 13),
  ('Experiência Imersiva', 14),
  ('Dress Code Específico', 15),
  ('Ingresso Solidário', 16),
  ('Meet & Greet', 17),
  ('Lote Limitado', 18),
  ('Área Premium', 19),
  ('Lounge Exclusivo', 20),
  ('Front Stage', 21),
  ('Backstage Access', 22),
  ('Festival Boutique', 23),
  ('Evento Secreto', 24),
  ('Lista VIP', 25),
  ('Área Camarote', 26),
  ('Brunch Party', 27),
  ('Happy Hour', 28),
  ('Degustação Especial', 29)
ON CONFLICT (label) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- NOVOS CAMPOS EM eventos_admin
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.eventos_admin
  ADD COLUMN IF NOT EXISTS formato TEXT,
  ADD COLUMN IF NOT EXISTS estilos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experiencias TEXT[] DEFAULT '{}';
