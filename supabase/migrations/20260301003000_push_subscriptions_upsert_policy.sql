-- Fix: adicionar policy UPDATE para push_subscriptions
-- O pushService usa upsert() que precisa de INSERT + UPDATE
-- Sem UPDATE policy, upsert falha com 409 (duplicate key)

CREATE POLICY "push_upd" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
