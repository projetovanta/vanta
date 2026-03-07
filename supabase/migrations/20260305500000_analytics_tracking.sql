-- analytics_events: tracking de ações do usuário
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_insert_own" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_select_master" ON analytics_events FOR SELECT USING (is_masteradm());
CREATE INDEX idx_analytics_type_date ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_user ON analytics_events(user_id, event_type, created_at);
CREATE INDEX idx_analytics_event ON analytics_events(event_id) WHERE event_id IS NOT NULL;

-- pmf_responses: survey de product-market fit
CREATE TABLE IF NOT EXISTS pmf_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE pmf_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmf_insert_own" ON pmf_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pmf_select_master" ON pmf_responses FOR SELECT USING (is_masteradm());
