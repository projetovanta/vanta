// ── Mapa esperado do app — dados estáticos para diagnóstico ──────────────

export interface ExpectedColumn {
  name: string;
  type: string; // ex: 'uuid', 'text', 'boolean', 'integer', 'jsonb', 'ARRAY'
}

export interface ExpectedTable {
  name: string;
  columns: ExpectedColumn[];
  realtime: boolean;
  createSQL: string; // SQL para criar se não existir (vazio = só diagnóstico)
}

export const EXPECTED_TABLES: ExpectedTable[] = [
  {
    name: 'profiles',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'nome', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'full_name', type: 'text' },
      { name: 'role', type: 'text' },
      { name: 'avatar_url', type: 'text' },
      { name: 'genero', type: 'text' },
      { name: 'data_nascimento', type: 'date' },
      { name: 'estado', type: 'text' },
      { name: 'cidade', type: 'text' },
      { name: 'telefone_ddd', type: 'text' },
      { name: 'telefone_numero', type: 'text' },
      { name: 'biografia', type: 'text' },
      { name: 'instagram', type: 'text' },
      { name: 'interesses', type: 'ARRAY' },
      { name: 'album_urls', type: 'ARRAY' },
      { name: 'privacidade', type: 'jsonb' },
      { name: 'curadoria_concluida', type: 'boolean' },
      { name: 'notas_admin', type: 'text' },
      { name: 'foto', type: 'text' },
      { name: 'status', type: 'text' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'eventos_admin',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'comunidade_id', type: 'uuid' },
      { name: 'nome', type: 'text' },
      { name: 'descricao', type: 'text' },
      { name: 'data_inicio', type: 'timestamp with time zone' },
      { name: 'data_fim', type: 'timestamp with time zone' },
      { name: 'local', type: 'text' },
      { name: 'endereco', type: 'text' },
      { name: 'cidade', type: 'text' },
      { name: 'foto', type: 'text' },
      { name: 'publicado', type: 'boolean' },
      { name: 'caixa_ativo', type: 'boolean' },
      { name: 'vanta_fee_percent', type: 'numeric' },
      { name: 'vanta_fee_fixed', type: 'numeric' },
      { name: 'gateway_fee_mode', type: 'text' },
      { name: 'created_by', type: 'uuid' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'comunidades',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'nome', type: 'text' },
      { name: 'descricao', type: 'text' },
      { name: 'cidade', type: 'text' },
      { name: 'endereco', type: 'text' },
      { name: 'foto', type: 'text' },
      { name: 'foto_capa', type: 'text' },
      { name: 'ativa', type: 'boolean' },
      { name: 'cargos_customizados', type: 'jsonb' },
      { name: 'vanta_fee_percent', type: 'numeric' },
      { name: 'vanta_fee_fixed', type: 'numeric' },
      { name: 'gateway_fee_mode', type: 'text' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'tickets_caixa',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'lote_id', type: 'uuid' },
      { name: 'variacao_id', type: 'uuid' },
      { name: 'email', type: 'text' },
      { name: 'owner_id', type: 'uuid' },
      { name: 'valor', type: 'numeric' },
      { name: 'status', type: 'text' },
      { name: 'nome_titular', type: 'text' },
      { name: 'cpf', type: 'text' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'lotes',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'nome', type: 'text' },
      { name: 'ativo', type: 'boolean' },
      { name: 'ordem', type: 'integer' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'variacoes_ingresso',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'lote_id', type: 'uuid' },
      { name: 'area', type: 'text' },
      { name: 'genero', type: 'text' },
      { name: 'valor', type: 'numeric' },
      { name: 'limite', type: 'integer' },
      { name: 'vendidos', type: 'integer' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'equipe_evento',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'membro_id', type: 'uuid' },
      { name: 'papel', type: 'text' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'transactions',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'ticket_id', type: 'uuid' },
      { name: 'email', type: 'text' },
      { name: 'valor_bruto', type: 'numeric' },
      { name: 'status', type: 'text' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'solicitacoes_saque',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'produtor_id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'valor', type: 'numeric' },
      { name: 'status', type: 'text' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'vendas_log',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
      { name: 'variacao_label', type: 'text' },
      { name: 'valor', type: 'numeric' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'atribuicoes_rbac',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'user_id', type: 'uuid' },
      { name: 'tenant_type', type: 'text' },
      { name: 'tenant_id', type: 'uuid' },
      { name: 'cargo', type: 'text' },
      { name: 'permissoes', type: 'ARRAY' },
      { name: 'ativo', type: 'boolean' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'notifications',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'user_id', type: 'uuid' },
      { name: 'titulo', type: 'text' },
      { name: 'mensagem', type: 'text' },
      { name: 'tipo', type: 'text' },
      { name: 'lida', type: 'boolean' },
      { name: 'link', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'messages',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'sender_id', type: 'uuid' },
      { name: 'recipient_id', type: 'uuid' },
      { name: 'text', type: 'text' },
      { name: 'is_read', type: 'boolean' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'audit_logs',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'user_id', type: 'uuid' },
      { name: 'action', type: 'text' },
      { name: 'entity_type', type: 'text' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'listas_evento',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'regras_lista',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'lista_id', type: 'uuid' },
      { name: 'label', type: 'text' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'cotas_promoter',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'lista_id', type: 'uuid' },
      { name: 'regra_id', type: 'uuid' },
      { name: 'promoter_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: '',
  },
  {
    name: 'convidados_lista',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'lista_id', type: 'uuid' },
      { name: 'nome', type: 'text' },
      { name: 'checked_in', type: 'boolean' },
    ],
    realtime: true,
    createSQL: '',
  },
  {
    name: 'interesses',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'label', type: 'text' },
      { name: 'icone', type: 'text' },
      { name: 'ativo', type: 'boolean' },
      { name: 'ordem', type: 'integer' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS interesses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), label TEXT NOT NULL, icone TEXT NOT NULL DEFAULT 'Zap', ativo BOOLEAN NOT NULL DEFAULT true, ordem INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()); ALTER TABLE interesses ENABLE ROW LEVEL SECURITY; CREATE POLICY "master_full_access" ON interesses FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm') WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm'); CREATE POLICY "anyone_can_read_active" ON interesses FOR SELECT USING (ativo = true);`,
  },
  {
    name: 'cortesias_config',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS cortesias_config (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), evento_id UUID REFERENCES eventos_admin(id) ON DELETE CASCADE, limite INT DEFAULT 0, variacoes TEXT[] DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now()); ALTER TABLE cortesias_config ENABLE ROW LEVEL SECURITY; CREATE POLICY "cortesias_config_master" ON cortesias_config FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm') WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm'); CREATE POLICY "cortesias_config_read_equipe" ON cortesias_config FOR SELECT USING (auth.uid() IS NOT NULL);`,
  },
  {
    name: 'cortesias_log',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS cortesias_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), evento_id UUID REFERENCES eventos_admin(id) ON DELETE CASCADE, remetente_nome TEXT DEFAULT '', destinatario_nome TEXT DEFAULT '', variacao_label TEXT DEFAULT '', quantidade INT DEFAULT 1, created_at TIMESTAMPTZ DEFAULT now()); ALTER TABLE cortesias_log ENABLE ROW LEVEL SECURITY; CREATE POLICY "cortesias_log_read_auth" ON cortesias_log FOR SELECT USING (auth.uid() IS NOT NULL); CREATE POLICY "cortesias_log_insert_auth" ON cortesias_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
  },
  {
    name: 'vanta_indica',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'tipo', type: 'text' },
      { name: 'titulo', type: 'text' },
      { name: 'ativo', type: 'boolean' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS vanta_indica (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tipo TEXT DEFAULT 'LOCAL', imagem TEXT DEFAULT '', badge TEXT DEFAULT '', titulo TEXT DEFAULT '', subtitulo TEXT DEFAULT '', ativo BOOLEAN DEFAULT true, alvo_localidades TEXT[] DEFAULT '{}', acao_link TEXT DEFAULT '', acao TEXT DEFAULT 'VER', criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT now()); ALTER TABLE vanta_indica ENABLE ROW LEVEL SECURITY; CREATE POLICY "indica_read_auth" ON vanta_indica FOR SELECT USING (auth.uid() IS NOT NULL); CREATE POLICY "indica_write_master" ON vanta_indica FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm') WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm');`,
  },
  {
    name: 'reembolsos',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'ticket_id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS reembolsos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID REFERENCES tickets_caixa(id) ON DELETE SET NULL, evento_id UUID REFERENCES eventos_admin(id) ON DELETE RESTRICT, tipo TEXT DEFAULT 'MANUAL', motivo TEXT DEFAULT '', valor NUMERIC(10,2) DEFAULT 0, solicitado_por UUID REFERENCES profiles(id) ON DELETE SET NULL, aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL, solicitado_em TIMESTAMPTZ DEFAULT now(), processado_em TIMESTAMPTZ, status TEXT DEFAULT 'PENDENTE'); ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY; CREATE POLICY "reembolsos_master" ON reembolsos FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm') WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm'); CREATE POLICY "reembolsos_read_equipe" ON reembolsos FOR SELECT USING (auth.uid() IS NOT NULL);`,
  },
  {
    name: 'chargebacks',
    columns: [
      { name: 'id', type: 'uuid' },
      { name: 'ticket_id', type: 'uuid' },
      { name: 'evento_id', type: 'uuid' },
    ],
    realtime: false,
    createSQL: `CREATE TABLE IF NOT EXISTS chargebacks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID REFERENCES tickets_caixa(id) ON DELETE SET NULL, evento_id UUID REFERENCES eventos_admin(id) ON DELETE RESTRICT, valor NUMERIC(10,2) DEFAULT 0, motivo TEXT DEFAULT '', gateway_ref TEXT DEFAULT '', status TEXT DEFAULT 'ABERTO', created_at TIMESTAMPTZ DEFAULT now()); ALTER TABLE chargebacks ENABLE ROW LEVEL SECURITY; CREATE POLICY "chargebacks_master" ON chargebacks FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm') WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'vanta_masteradm');`,
  },
];

export const EXPECTED_RPCS = ['processar_venda_caixa', 'queimar_ingresso', 'processar_compra_checkout'];
export const EXPECTED_BUCKETS = ['avatars', 'selfies', 'event-assets', 'indica-assets', 'profile-albums'];
