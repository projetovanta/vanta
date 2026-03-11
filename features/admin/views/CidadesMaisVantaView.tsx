/**
 * CidadesMaisVantaView — CRUD de cidades do programa MAIS VANTA.
 * Master cria cidades; delega gerente por cidade.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Plus, UserCheck, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { clubeCidadesService } from '../services/clube/clubeCidadesService';
import { useAuthStore } from '../../../stores/authStore';
import type { CidadeMaisVanta } from '../../../types';

export const CidadesMaisVantaView: React.FC = () => {
  const [cidades, setCidades] = useState<CidadeMaisVanta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');
  const currentUserId = useAuthStore(s => s.profile?.id ?? '');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await clubeCidadesService.listar();
    setCidades(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!nome.trim()) return;
    if (editId) {
      await clubeCidadesService.atualizar(editId, { nome: nome.trim(), estado: estado.trim() || undefined });
    } else {
      await clubeCidadesService.criar({
        nome: nome.trim(),
        estado: estado.trim() || undefined,
        criadoPor: currentUserId,
      });
    }
    setShowForm(false);
    setEditId(null);
    setNome('');
    setEstado('');
    load();
  };

  const toggleAtivo = async (c: CidadeMaisVanta) => {
    await clubeCidadesService.atualizar(c.id, { ativo: !c.ativo });
    load();
  };

  const startEdit = (c: CidadeMaisVanta) => {
    setEditId(c.id);
    setNome(c.nome);
    setEstado(c.estado ?? '');
    setShowForm(true);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size="1.125rem" className="text-[#FFD300]" />
          <h2 className="text-white font-bold text-sm">Cidades do Programa</h2>
          <span className="text-zinc-400 text-xs">({cidades.length})</span>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setNome('');
            setEstado('');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
        >
          <Plus size="0.75rem" />
          Nova Cidade
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-white text-xs font-bold">{editId ? 'Editar Cidade' : 'Nova Cidade'}</p>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome da cidade (ex: São Paulo)"
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
          />
          <input
            value={estado}
            onChange={e => setEstado(e.target.value)}
            placeholder="Estado (ex: SP)"
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-400 focus:outline-none focus:border-[#FFD300]/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-[#FFD300] text-black rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              {editId ? 'Salvar' : 'Criar'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-[0.625rem] font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-[#FFD300] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cidades.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size="2rem" className="text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-400 text-xs">Nenhuma cidade cadastrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cidades.map(c => (
            <div
              key={c.id}
              className={`bg-zinc-900/60 border rounded-xl p-3 flex items-center gap-3 ${
                c.ativo ? 'border-white/5' : 'border-red-500/20 opacity-60'
              }`}
            >
              <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
                <MapPin size="1rem" className="text-[#FFD300]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{c.nome}</p>
                <div className="flex items-center gap-2 text-[0.625rem] text-zinc-400">
                  {c.estado && <span>{c.estado}</span>}
                  {c.gerenteId && (
                    <span className="flex items-center gap-0.5">
                      <UserCheck size="0.625rem" />
                      Gerente definido
                    </span>
                  )}
                  {!c.ativo && <span className="text-red-400">Inativa</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => startEdit(c)}
                  className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all"
                >
                  <Edit3 size="0.75rem" className="text-zinc-400" />
                </button>
                <button
                  onClick={() => toggleAtivo(c)}
                  className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all"
                >
                  {c.ativo ? (
                    <ToggleRight size="0.875rem" className="text-green-400" />
                  ) : (
                    <ToggleLeft size="0.875rem" className="text-zinc-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
