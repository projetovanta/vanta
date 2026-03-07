import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Download, Users } from 'lucide-react';
import { PermissaoVanta } from '../../../../types';
import { eventosAdminService } from '../../services/eventosAdminService';
import { comunidadesService } from '../../services/comunidadesService';
import { VantaDropdown } from '../../../../components/VantaDropdown';
import { rbacService, CARGO_LABELS } from '../../services/rbacService';
import { MembroImportacao, PERM_LABELS, inputCls, labelCls } from './types';
import { QlCheckbox } from './QlCheckbox';

interface ImportarStaffPanelProps {
  currentUserId: string;
  destinoId: string;
  destinoNome: string;
  destinoTipo: 'COMUNIDADE' | 'EVENTO';
  onImportado: (count: number) => void;
}

export const ImportarStaffPanel: React.FC<ImportarStaffPanelProps> = ({
  currentUserId,
  destinoId,
  destinoNome,
  destinoTipo,
  onImportado,
}) => {
  const [eventoOrigemId, setEventoOrigemId] = useState('');
  const [membros, setMembros] = useState<MembroImportacao[]>([]);
  const [importando, setImportando] = useState(false);

  // Eventos anteriores do produtor (filtro por criadorId)
  const eventosDisponiveis = useMemo(() => {
    return eventosAdminService
      .getEventos()
      .filter(
        e =>
          e.criadorId === currentUserId ||
          rbacService
            .getAtribuicoesTenant('EVENTO', e.id)
            .some(a => a.userId === currentUserId && (a.cargo === 'SOCIO' || a.cargo === 'GERENTE')),
      );
  }, [currentUserId]);

  const handleSelecionarEvento = async (evId: string) => {
    setEventoOrigemId(evId);
    if (!evId) {
      setMembros([]);
      return;
    }
    const atribuicoes = rbacService.getAtribuicoesTenant('EVENTO', evId).filter(a => a.userId !== currentUserId);
    // Resolver nomes via Supabase
    const ids = atribuicoes.map(a => a.userId);
    let nomeMap: Record<string, { nome: string; foto?: string }> = {};
    if (ids.length > 0) {
      try {
        const { supabase } = await import('../../../../services/supabaseClient');
        const { data } = await supabase.from('profiles').select('id, nome, avatar_url').in('id', ids);
        (data ?? []).forEach((r: any) => {
          nomeMap[r.id] = { nome: r.nome ?? r.id, foto: r.avatar_url ?? '' };
        });
      } catch {
        /* fallback: usa userId */
      }
    }
    const lista: MembroImportacao[] = atribuicoes.map(a => ({
      userId: a.userId,
      nome: nomeMap[a.userId]?.nome ?? a.userId,
      foto: nomeMap[a.userId]?.foto,
      cargoOriginal: a.cargo,
      permissoes: [...a.permissoes],
      selecionado: false,
      expandido: false,
    }));
    setMembros(lista);
  };

  const toggleSelecionado = (userId: string) => {
    setMembros(prev => prev.map(m => (m.userId === userId ? { ...m, selecionado: !m.selecionado } : m)));
  };

  const toggleExpandido = (userId: string) => {
    setMembros(prev => prev.map(m => (m.userId === userId ? { ...m, expandido: !m.expandido } : m)));
  };

  const togglePermissao = (userId: string, perm: PermissaoVanta) => {
    setMembros(prev =>
      prev.map(m => {
        if (m.userId !== userId) return m;
        const tem = m.permissoes.includes(perm);
        return { ...m, permissoes: tem ? m.permissoes.filter(p => p !== perm) : [...m.permissoes, perm] };
      }),
    );
  };

  const selecionados = membros.filter(m => m.selecionado);

  const handleImportar = async () => {
    if (!selecionados.length) return;
    setImportando(true);
    const evDestino = eventoOrigemId ? eventosAdminService.getEvento(destinoId) : null;
    const tenantNome = destinoNome;
    const tenantFoto =
      destinoTipo === 'EVENTO'
        ? eventosAdminService.getEvento(destinoId)?.foto
        : comunidadesService.getAll().find(c => c.id === destinoId)?.foto;

    for (const m of selecionados) {
      await rbacService.atribuir({
        userId: m.userId,
        tenant: { tipo: destinoTipo, id: destinoId, nome: tenantNome, foto: tenantFoto },
        cargo: m.cargoOriginal,
        permissoes: m.permissoes,
        atribuidoPor: currentUserId,
        ativo: true,
      });
    }
    void evDestino; // satisfaz TS (sem uso intencional)
    setImportando(false);
    onImportado(selecionados.length);
  };

  return (
    <div className="space-y-4">
      {/* Seletor de evento anterior */}
      <div>
        <label className={labelCls}>Evento de origem</label>
        {eventosDisponiveis.length === 0 ? (
          <p className="text-zinc-600 text-xs py-2 pl-1">Nenhum evento anterior encontrado.</p>
        ) : (
          <VantaDropdown
            value={eventoOrigemId}
            onChange={handleSelecionarEvento}
            placeholder="Selecione um evento…"
            options={eventosDisponiveis.map(e => ({ value: e.id, label: e.nome }))}
          />
        )}
      </div>

      {/* Lista de membros */}
      {eventoOrigemId && membros.length === 0 && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Users size={24} className="text-zinc-700" />
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Nenhum membro neste evento</p>
        </div>
      )}

      {membros.length > 0 && (
        <div className="space-y-2">
          <p className={labelCls}>
            {membros.length} membro{membros.length > 1 ? 's' : ''} — selecione quem importar
          </p>
          {membros.map(m => (
            <div
              key={m.userId}
              className={`rounded-xl border transition-all overflow-hidden ${
                m.selecionado ? 'bg-[#FFD300]/5 border-[#FFD300]/20' : 'bg-zinc-900/40 border-white/5'
              }`}
            >
              {/* Linha principal */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox de seleção */}
                <button
                  type="button"
                  onClick={() => toggleSelecionado(m.userId)}
                  className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    m.selecionado ? 'bg-[#FFD300] border-[#FFD300]' : 'bg-zinc-900 border-white/20'
                  }`}
                >
                  {m.selecionado && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="black"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                {/* Avatar */}
                {m.foto ? (
                  <img
                    loading="lazy"
                    src={m.foto}
                    alt={m.nome}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-bold shrink-0">
                    {m.nome[0]}
                  </div>
                )}
                {/* Nome + cargo */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{m.nome}</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                    {CARGO_LABELS[m.cargoOriginal]}
                  </p>
                </div>
                {/* Botão expandir permissões */}
                {m.selecionado && (
                  <button
                    type="button"
                    onClick={() => toggleExpandido(m.userId)}
                    className="flex items-center gap-1 text-[9px] text-zinc-500 font-black uppercase tracking-wider active:text-white transition-all shrink-0"
                  >
                    Permissões
                    {m.expandido ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  </button>
                )}
              </div>

              {/* Painel de permissões granulares (expansível) */}
              {m.selecionado && m.expandido && (
                <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-2.5 bg-zinc-900/30">
                  <p className={labelCls}>Permissões granulares</p>
                  {PERM_LABELS.map(p => (
                    <QlCheckbox
                      key={p.id}
                      checked={m.permissoes.includes(p.id)}
                      onChange={() => togglePermissao(m.userId, p.id)}
                      label={p.label}
                      sublabel={p.sub}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão importar */}
      {selecionados.length > 0 && (
        <button
          type="button"
          onClick={handleImportar}
          disabled={importando}
          className="w-full py-4 bg-[#FFD300] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Download size={13} className="inline mr-2 -mt-0.5" />
          Importar {selecionados.length} membro{selecionados.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};
