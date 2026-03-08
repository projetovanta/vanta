import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, PieChart } from 'lucide-react';
import { supabase } from '../../../../services/supabaseClient';
import { VantaPieChart, PieSlice } from '../../components/VantaPieChart';
import { CORES_GENERO, CORES_IDADE, CORES_CIDADE, calcIdade, faixaEtaria } from './eventoDashboardUtils';

export const AnalyticsSubView: React.FC<{
  eventoId: string;
  onBack: () => void;
}> = ({ eventoId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [generoData, setGeneroData] = useState<PieSlice[]>([]);
  const [idadeData, setIdadeData] = useState<PieSlice[]>([]);
  const [cidadeData, setCidadeData] = useState<PieSlice[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Buscar tickets com owner_id e email
      const { data: tickets } = await supabase
        .from('tickets_caixa')
        .select('owner_id, email')
        .eq('evento_id', eventoId)
        .in('status', ['DISPONIVEL', 'USADO']);

      const rows = tickets ?? [];
      if (cancelled || rows.length === 0) {
        setLoading(false);
        return;
      }

      setTotalTickets(rows.length);

      // Coletar owner_ids diretos
      const ownerIds = [...new Set(rows.map((t: { owner_id?: string }) => t.owner_id).filter(Boolean))] as string[];

      // Coletar emails de tickets SEM owner_id (para fallback)
      const emailsFallback = [
        ...new Set(
          rows
            .filter((t: { owner_id?: string; email?: string }) => !t.owner_id && t.email)
            .map((t: { email: string }) => t.email.toLowerCase()),
        ),
      ];

      // Buscar profiles por owner_id
      type ProfileSlice = {
        id: string;
        genero: string | null;
        data_nascimento: string | null;
        cidade: string | null;
        email?: string | null;
      };
      let profilesById: ProfileSlice[] = [];
      if (ownerIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, genero, data_nascimento, cidade')
          .in('id', ownerIds);
        profilesById = (data ?? []) as ProfileSlice[];
      }

      if (cancelled) return;

      // Buscar profiles por email (fallback para tickets sem owner_id)
      let profilesByEmail: ProfileSlice[] = [];
      if (emailsFallback.length > 0) {
        const existingIds = new Set(profilesById.map(p => p.id));
        const { data } = await supabase
          .from('profiles')
          .select('id, genero, data_nascimento, cidade, email')
          .in('email', emailsFallback);
        // Evitar duplicatas (profile já encontrado por owner_id)
        profilesByEmail = ((data ?? []) as ProfileSlice[]).filter(p => !existingIds.has(p.id));
      }

      if (cancelled) return;

      const profs = [...profilesById, ...profilesByEmail];
      setTotalParticipantes(profs.length);

      // Gênero
      const genMap: Record<string, number> = {};
      profs.forEach(p => {
        const g = p.genero === 'MASCULINO' ? 'Masculino' : p.genero === 'FEMININO' ? 'Feminino' : 'N/I';
        genMap[g] = (genMap[g] || 0) + 1;
      });
      setGeneroData(
        Object.entries(genMap).map(([name, value], i) => ({
          name,
          value,
          color: CORES_GENERO[i % CORES_GENERO.length],
        })),
      );

      // Faixa etária
      const ageMap: Record<string, number> = {};
      profs.forEach(p => {
        if (!p.data_nascimento) {
          ageMap['N/I'] = (ageMap['N/I'] || 0) + 1;
          return;
        }
        const fx = faixaEtaria(calcIdade(p.data_nascimento as string));
        ageMap[fx] = (ageMap[fx] || 0) + 1;
      });
      const ageOrder = ['<18', '18-24', '25-34', '35-44', '45+', 'N/I'];
      setIdadeData(
        ageOrder
          .filter(k => ageMap[k])
          .map((name, i) => ({ name, value: ageMap[name], color: CORES_IDADE[i % CORES_IDADE.length] })),
      );

      // Cidade — top 5
      const cityMap: Record<string, number> = {};
      profs.forEach(p => {
        const c = (p.cidade as string)?.trim() || 'N/I';
        cityMap[c] = (cityMap[c] || 0) + 1;
      });
      const sorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
      const top5 = sorted.slice(0, 5);
      const outrasCount = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
      const citySlices: PieSlice[] = top5.map(([name, value], i) => ({
        name,
        value,
        color: CORES_CIDADE[i % CORES_CIDADE.length],
      }));
      if (outrasCount > 0) citySlices.push({ name: 'Outras', value: outrasCount, color: '#71717a' });
      setCidadeData(citySlices);

      setLoading(false);
    })().catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button
            aria-label="Voltar"
            onClick={onBack}
            className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-0.5">Análise</p>
            <h1 className="font-serif italic text-xl text-white">Analytics de Público</h1>
          </div>
        </div>
        {totalTickets > 0 && (
          <p className="text-zinc-400 text-[10px] mt-1">
            {totalParticipantes} de {totalTickets} participante{totalTickets !== 1 ? 's' : ''} com perfil
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 max-w-3xl mx-auto w-full space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="text-zinc-400 animate-spin" />
          </div>
        ) : totalParticipantes === 0 ? (
          <div className="text-center py-16">
            <PieChart size={24} className="text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-400 text-xs">Nenhum participante com perfil encontrado</p>
            {totalTickets > 0 && (
              <p className="text-zinc-700 text-[10px] mt-2">
                {totalTickets} ingresso{totalTickets !== 1 ? 's' : ''} vendido{totalTickets !== 1 ? 's' : ''}, mas sem
                perfis vinculados
              </p>
            )}
          </div>
        ) : (
          <>
            {generoData.length > 0 && (
              <div>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-4">Gênero</p>
                <VantaPieChart data={generoData} height={140} />
              </div>
            )}
            {idadeData.length > 0 && (
              <div>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-4">Faixa Etária</p>
                <VantaPieChart data={idadeData} height={140} />
              </div>
            )}
            {cidadeData.length > 0 && (
              <div>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-4">Cidade</p>
                <VantaPieChart data={cidadeData} height={140} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
