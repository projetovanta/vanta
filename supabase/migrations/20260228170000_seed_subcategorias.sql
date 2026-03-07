-- Seed de subcategorias padrão vinculadas às categorias principais existentes
-- O master pode editar/remover via CategoriasAdminView

-- Festa
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Aniversário', 0), ('Temática', 1), ('Corporativo', 2), ('Réveillon', 3), ('Halloween', 4), ('Carnaval', 5), ('Pool Party', 6), ('Sunset', 7)) AS sub(label, ordem)
WHERE p.label = 'Festa' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Show
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Ao Vivo', 0), ('Stand-up', 1), ('Tributo', 2), ('Acústico', 3), ('Pocket Show', 4)) AS sub(label, ordem)
WHERE p.label = 'Show' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Balada
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Noite', 0), ('After', 1), ('Before', 2), ('Lounge', 3), ('Rooftop', 4)) AS sub(label, ordem)
WHERE p.label = 'Balada' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Funk
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Baile', 0), ('Funk Melody', 1), ('Funk Ostentação', 2), ('Pancadão', 3), ('Funk Proibidão', 4)) AS sub(label, ordem)
WHERE p.label = 'Funk' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Sertanejo
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Universitário', 0), ('Raiz', 1), ('Sofrência', 2), ('Modão', 3), ('Sertanejo Pop', 4)) AS sub(label, ordem)
WHERE p.label = 'Sertanejo' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Pagode
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Roda de Pagode', 0), ('Pagode 90s', 1), ('Pagodão', 2), ('Samba Pagode', 3)) AS sub(label, ordem)
WHERE p.label = 'Pagode' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Samba
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Roda de Samba', 0), ('Samba Rock', 1), ('Samba Enredo', 2), ('Samba de Raiz', 3), ('Bossa Nova', 4)) AS sub(label, ordem)
WHERE p.label = 'Samba' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Rock
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Rock Nacional', 0), ('Indie', 1), ('Metal', 2), ('Punk', 3), ('Classic Rock', 4), ('Rock Alternativo', 5)) AS sub(label, ordem)
WHERE p.label = 'Rock' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Eletrônica
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Techno', 0), ('House', 1), ('Trance', 2), ('Bass', 3), ('EDM', 4), ('Drum & Bass', 5), ('Deep House', 6), ('Minimal', 7)) AS sub(label, ordem)
WHERE p.label = 'Eletrônica' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Hip-Hop
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Rap Nacional', 0), ('Trap', 1), ('R&B', 2), ('Freestyle', 3), ('Batalha de MC', 4)) AS sub(label, ordem)
WHERE p.label = 'Hip-Hop' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Pop
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Pop Nacional', 0), ('K-Pop', 1), ('Pop Internacional', 2), ('Pop Rock', 3), ('Dance Pop', 4)) AS sub(label, ordem)
WHERE p.label = 'Pop' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Forró
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Forró Pé de Serra', 0), ('Forró Eletrônico', 1), ('Forró Universitário', 2), ('Xote', 3), ('Arrasta-pé', 4)) AS sub(label, ordem)
WHERE p.label = 'Forró' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Open Bar
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Open Bar Total', 0), ('Open Beer', 1), ('Open Drinks', 2), ('Premium', 3), ('Open + Comida', 4)) AS sub(label, ordem)
WHERE p.label = 'Open Bar' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Day Party
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Day Use', 0), ('Brunch', 1), ('Garden Party', 2), ('Beach Club', 3), ('Sunset', 4)) AS sub(label, ordem)
WHERE p.label = 'Day Party' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;

-- Festival
INSERT INTO categorias_evento (label, ordem, parent_id)
SELECT sub.label, sub.ordem, p.id
FROM categorias_evento p,
(VALUES ('Multi-palco', 0), ('Gastronômico', 1), ('Cultural', 2), ('Esportivo', 3), ('Música', 4), ('Arte', 5)) AS sub(label, ordem)
WHERE p.label = 'Festival' AND p.parent_id IS NULL
ON CONFLICT (label) DO NOTHING;
