-- User Behavior tracking para alimentar IndicaPraVoce
-- Ações: VIEW (viu evento), PURCHASE (comprou), FAVORITE (favoritou), DWELL (tempo na tela)

-- Drop tabela antiga (schema incompatível, 0 registros)
DROP TABLE IF EXISTS public.user_behavior CASCADE;

CREATE TABLE public.user_behavior (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.eventos_admin(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('VIEW', 'PURCHASE', 'FAVORITE', 'DWELL')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_user_behavior_user_action ON public.user_behavior(user_id, action_type);
CREATE INDEX idx_user_behavior_event ON public.user_behavior(event_id);
CREATE INDEX idx_user_behavior_created ON public.user_behavior(created_at DESC);

-- RLS
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_behavior_select_own" ON public.user_behavior
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_behavior_insert_own" ON public.user_behavior
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RPC: eventos recomendados combinando interesses do perfil + behavior
-- Behavior pesa mais (x2) que interesses do onboarding
CREATE OR REPLACE FUNCTION public.eventos_recomendados_behavior(
  p_user_id uuid,
  p_cidade text,
  p_limit int DEFAULT 20
)
RETURNS SETOF public.eventos_admin
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH behavior_tags AS (
    SELECT DISTINCT
      e.formato,
      unnest(e.estilos) AS estilo,
      CASE ub.action_type
        WHEN 'PURCHASE' THEN 3
        WHEN 'FAVORITE' THEN 2
        WHEN 'DWELL' THEN 1.5
        WHEN 'VIEW' THEN 1
      END AS peso
    FROM public.user_behavior ub
    JOIN public.eventos_admin e ON e.id = ub.event_id
    WHERE ub.user_id = p_user_id
      AND ub.created_at > now() - interval '90 days'
  ),
  behavior_scores AS (
    SELECT e.id, SUM(bt.peso) AS score
    FROM public.eventos_admin e
    JOIN behavior_tags bt ON (e.formato = bt.formato OR bt.estilo = ANY(e.estilos))
    WHERE e.cidade = p_cidade
      AND e.data_inicio > now()
      AND e.status_evento = 'publicado'
    GROUP BY e.id
  ),
  interesse_scores AS (
    SELECT e.id, COUNT(*)::float AS score
    FROM public.eventos_admin e
    JOIN public.profiles p ON p.id = p_user_id
    WHERE e.cidade = p_cidade
      AND e.data_inicio > now()
      AND e.status_evento = 'publicado'
      AND p.interesses IS NOT NULL
      AND (
        e.formato = ANY(p.interesses)
        OR EXISTS (
          SELECT 1 FROM unnest(e.estilos) es
          WHERE es = ANY(p.interesses)
        )
      )
    GROUP BY e.id
  ),
  combined AS (
    SELECT
      COALESCE(b.id, i.id) AS event_id,
      COALESCE(b.score, 0) * 2 + COALESCE(i.score, 0) AS total_score
    FROM behavior_scores b
    FULL OUTER JOIN interesse_scores i ON b.id = i.id
  )
  SELECT e.*
  FROM public.eventos_admin e
  JOIN combined c ON e.id = c.event_id
  ORDER BY c.total_score DESC, e.data_inicio ASC
  LIMIT p_limit;
$$;
