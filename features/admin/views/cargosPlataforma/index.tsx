import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Shield, Trash2, UserPlus, Search, X, Check } from 'lucide-react';
import {
  cargosPlataformaService,
  PERMISSOES_PLATAFORMA,
  PERMISSAO_LABELS,
  type CargoPlataforma,
  type AtribuicaoPlataforma,
  type PermissaoPlataforma,
} from '../../services/cargosPlataformaService';

interface Props {
  currentUserId: string;
  onBack: () => void;
  /** Quando true, esconde header próprio (usado dentro do CargosUnificadoView) */
  embedded?: boolean;
}

export const CargosPlataformaView: React.FC<Props> = ({ currentUserId, onBack, embedded }) => {
  const [cargos, setCargos] = useState<CargoPlataforma[]>([]);
  const [atribuicoes, setAtribuicoes] = useState<AtribuicaoPlataforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'CARGOS' | 'ATRIBUICOES'>('CARGOS');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPermissoes, setFormPermissoes] = useState<PermissaoPlataforma[]>([]);

  // Atribuição state
  const [showAtribuir, setShowAtribuir] = useState(false);
  const [atribuirCargoId, setAtribuirCargoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; nome: string; email: string }[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [c, a] = await Promise.all([cargosPlataformaService.getCargos(), cargosPlataformaService.getAtribuicoes()]);
    setCargos(c);
    setAtribuicoes(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async () => {
    if (!formNome.trim()) return;
    try {
      if (editingId) {
        await cargosPlataformaService.atualizarCargo(editingId, {
          nome: formNome,
          descricao: formDescricao,
          permissoes: formPermissoes,
        });
      } else {
        await cargosPlataformaService.criarCargo({
          nome: formNome,
          descricao: formDescricao,
          permissoes: formPermissoes,
          criadoPor: currentUserId,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormNome('');
      setFormDescricao('');
      setFormPermissoes([]);
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEdit = (cargo: CargoPlataforma) => {
    setEditingId(cargo.id);
    setFormNome(cargo.nome);
    setFormDescricao(cargo.descricao);
    setFormPermissoes([...cargo.permissoes]);
    setShowForm(true);
  };

  const handleDesativar = async (id: string) => {
    if (!confirm('Tem certeza que quer desativar este cargo?')) return;
    await cargosPlataformaService.desativarCargo(id);
    await refresh();
  };

  const handleSearch = async (termo: string) => {
    setSearchTerm(termo);
    if (termo.length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await cargosPlataformaService.buscarUsuarios(termo);
    setSearchResults(results);
  };

  const handleAtribuir = async (userId: string) => {
    if (!atribuirCargoId) return;
    try {
      await cargosPlataformaService.atribuir({
        userId,
        cargoId: atribuirCargoId,
        atribuidoPor: currentUserId,
      });
      setShowAtribuir(false);
      setSearchTerm('');
      setSearchResults([]);
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRevogar = async (atribuicaoId: string) => {
    if (!confirm('Tem certeza que quer revogar esta atribuição?')) return;
    await cargosPlataformaService.revogar(atribuicaoId);
    await refresh();
  };

  const togglePermissao = (p: PermissaoPlataforma) => {
    setFormPermissoes(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]));
  };

  return (
    <div
      className={
        embedded
          ? 'flex flex-col flex-1 overflow-hidden bg-[#0A0A0A]'
          : 'absolute inset-0 flex flex-col overflow-hidden bg-[#0A0A0A]'
      }
    >
      {/* Header — escondido quando embedded */}
      {!embedded && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button onClick={onBack} className="p-2 -ml-2 min-w-11 min-h-11 flex items-center justify-center">
            <ArrowLeft size={20} className="text-white/60" />
          </button>
          <Shield size={20} className="text-amber-400" />
          <h1 className="text-lg font-bold text-white">Cargos da Plataforma</h1>
        </div>
      )}

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-white/10">
        {(['CARGOS', 'ATRIBUICOES'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
              tab === t ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50'
            }`}
          >
            {t === 'CARGOS' ? `Cargos (${cargos.length})` : `Atribuições (${atribuicoes.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {loading ? (
          <p className="text-white/40 text-center py-8">Carregando...</p>
        ) : tab === 'CARGOS' ? (
          <>
            {/* Botão criar */}
            <button
              onClick={() => {
                setEditingId(null);
                setFormNome('');
                setFormDescricao('');
                setFormPermissoes([]);
                setShowForm(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400/10 text-amber-400 text-sm font-medium min-h-[44px]"
            >
              <Plus size={16} />
              Criar Cargo
            </button>

            {/* Lista de cargos */}
            {cargos.map(cargo => (
              <div key={cargo.id} className="bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{cargo.nome}</h3>
                    {cargo.descricao && <p className="text-white/40 text-xs mt-0.5">{cargo.descricao}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cargo)}
                      className="p-2 text-white/40 hover:text-white min-w-11 min-h-11 flex items-center justify-center"
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => handleDesativar(cargo.id)}
                      className="p-2 text-red-400/60 hover:text-red-400 min-w-11 min-h-11 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cargo.permissoes.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                      {PERMISSAO_LABELS[p]}
                    </span>
                  ))}
                </div>
                <div className="text-white/30 text-[10px]">
                  {atribuicoes.filter(a => a.cargoId === cargo.id).length} usuário(s) com este cargo
                </div>
              </div>
            ))}

            {cargos.length === 0 && <p className="text-white/30 text-center py-8 text-sm">Nenhum cargo criado ainda</p>}
          </>
        ) : (
          <>
            {/* Botão atribuir */}
            <button
              onClick={() => setShowAtribuir(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400/10 text-amber-400 text-sm font-medium min-h-[44px]"
            >
              <UserPlus size={16} />
              Atribuir Cargo
            </button>

            {/* Lista de atribuições */}
            {atribuicoes.map(a => (
              <div key={a.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{a.userNome}</p>
                  <p className="text-amber-400 text-xs">{a.cargoNome}</p>
                </div>
                <button
                  onClick={() => handleRevogar(a.id)}
                  className="p-2 text-red-400/60 hover:text-red-400 min-w-11 min-h-11 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {atribuicoes.length === 0 && <p className="text-white/30 text-center py-8 text-sm">Nenhuma atribuição</p>}
          </>
        )}
      </div>

      {/* Modal criar/editar cargo */}
      {showForm && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="w-full max-w-[500px] bg-[#1A1A1A] rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">{editingId ? 'Editar Cargo' : 'Novo Cargo'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center"
              >
                <X size={20} className="text-white/40" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome do cargo"
              value={formNome}
              onChange={e => setFormNome(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 min-h-[44px]"
            />

            <input
              type="text"
              placeholder="Descrição (opcional)"
              value={formDescricao}
              onChange={e => setFormDescricao(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 min-h-[44px]"
            />

            <div className="space-y-2">
              <p className="text-white/60 text-xs font-medium">Permissões</p>
              {PERMISSOES_PLATAFORMA.map(p => (
                <button
                  key={p}
                  onClick={() => togglePermissao(p)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm min-h-[44px] transition-colors ${
                    formPermissoes.includes(p)
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                      : 'bg-white/5 text-white/60 border border-white/10'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      formPermissoes.includes(p) ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                  >
                    {formPermissoes.includes(p) && <Check size={14} className="text-black" />}
                  </div>
                  {PERMISSAO_LABELS[p]}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={!formNome.trim()}
              className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold text-sm disabled:opacity-40 min-h-[44px]"
            >
              {editingId ? 'Salvar' : 'Criar Cargo'}
            </button>
          </div>
        </div>
      )}

      {/* Modal atribuir cargo */}
      {showAtribuir && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-end justify-center">
          <div className="w-full max-w-[500px] bg-[#1A1A1A] rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Atribuir Cargo</h2>
              <button
                onClick={() => {
                  setShowAtribuir(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center"
              >
                <X size={20} className="text-white/40" />
              </button>
            </div>

            {/* Selecionar cargo */}
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-medium">Cargo</p>
              <div className="flex flex-wrap gap-2">
                {cargos.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAtribuirCargoId(c.id)}
                    className={`px-3 py-2 rounded-lg text-xs min-h-[44px] ${
                      atribuirCargoId === c.id
                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                        : 'bg-white/5 text-white/60 border border-white/10'
                    }`}
                  >
                    {c.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Buscar usuário */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar usuário por nome..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/30 min-h-[44px]"
              />
            </div>

            {/* Resultados */}
            <div className="space-y-2">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleAtribuir(user.id)}
                  disabled={!atribuirCargoId}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl text-sm disabled:opacity-40 min-h-[44px]"
                >
                  <div>
                    <p className="text-white font-medium">{user.nome}</p>
                    <p className="text-white/30 text-xs">{user.email}</p>
                  </div>
                  <UserPlus size={16} className="text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
