-- Permitir usuário ver própria resposta PMF (necessário para checkPmfEligible)
CREATE POLICY "pmf_select_own" ON pmf_responses FOR SELECT USING (auth.uid() = user_id);
