-- Simplificar categorias_evento: de 158 entradas confusas para 12 categorias limpas
-- Gêneros musicais → tabela 'estilos' (30 entradas)
-- Formatos/local → tabela 'formatos' (30 entradas)
-- Categorias = TIPO do evento (ex: Festa, Show, Balada)

DELETE FROM categorias_evento;

INSERT INTO categorias_evento (label) VALUES
  ('Festa'),
  ('Show'),
  ('Balada'),
  ('Festival'),
  ('Day Party'),
  ('Gastronomia'),
  ('Teatro & Arte'),
  ('Esporte'),
  ('Profissional'),
  ('Bem-Estar'),
  ('Moda'),
  ('Experiência');
