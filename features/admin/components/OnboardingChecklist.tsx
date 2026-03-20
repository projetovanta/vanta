import React, { useEffect, useState } from 'react';
import { TYPOGRAPHY } from '../../../constants';
import { Check, Camera, Image, MapPin, Clock, CalendarPlus } from 'lucide-react';
import type { Comunidade } from '../../../types';
import type { HorarioSemanal } from '../../../types/eventos';
import { supabase } from '../../../services/supabaseClient';
import { comunidadesService } from '../services/comunidadesService';

interface Props {
  comunidade: Comunidade;
  onNavigate: (view: string) => void;
  onEditarComunidade: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  done: boolean;
  action: () => void;
}

export const OnboardingChecklist: React.FC<Props> = ({ comunidade, onNavigate, onEditarComunidade }) => {
  const [temEvento, setTemEvento] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('eventos_admin')
      .select('id')
      .eq('comunidade_id', comunidade.id)
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) {
          setTemEvento((data ?? []).length > 0);
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [comunidade.id]);

  const fotoOk = Boolean(comunidade.foto);
  const capaOk = Boolean(comunidade.fotoCapa && comunidade.fotoCapa !== comunidade.foto);
  const enderecoOk = Boolean(
    comunidade.endereco && !comunidade.endereco.startsWith('http') && comunidade.endereco.length > 5,
  );
  const horarioOk = Boolean(
    comunidade.horarioFuncionamento &&
    comunidade.horarioFuncionamento.length > 0 &&
    comunidade.horarioFuncionamento.some((h: HorarioSemanal) => h.aberto),
  );

  const items: CheckItem[] = [
    {
      id: 'foto',
      label: 'Foto de perfil',
      icon: <Camera className="w-4 h-4" />,
      done: fotoOk,
      action: onEditarComunidade,
    },
    {
      id: 'capa',
      label: 'Foto de capa',
      icon: <Image className="w-4 h-4" />,
      done: capaOk,
      action: onEditarComunidade,
    },
  ];

  if (comunidade.tipo_comunidade !== 'PRODUTORA') {
    items.push({
      id: 'endereco',
      label: 'Endereço completo',
      icon: <MapPin className="w-4 h-4" />,
      done: enderecoOk,
      action: onEditarComunidade,
    });
  }

  items.push(
    {
      id: 'horario',
      label: 'Horários de funcionamento',
      icon: <Clock className="w-4 h-4" />,
      done: horarioOk,
      action: onEditarComunidade,
    },
    {
      id: 'evento',
      label: 'Criar primeiro evento',
      icon: <CalendarPlus className="w-4 h-4" />,
      done: temEvento,
      action: () => onNavigate('CRIAR_EVENTO'),
    },
  );

  const completed = items.filter(i => i.done).length;
  const total = items.length;
  const allDone = completed === total;

  // Auto-marcar onboarding completo quando tudo pronto
  useEffect(() => {
    if (allDone && !checking && !comunidade.onboarding_completo) {
      comunidadesService.atualizar(comunidade.id, { onboarding_completo: true });
    }
  }, [allDone, checking, comunidade.id, comunidade.onboarding_completo]);

  if (checking || allDone) return null;

  return (
    <div className="bg-zinc-900/80 border border-[#FFD300]/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p style={TYPOGRAPHY.sectionKicker} className="text-[#FFD300]/80">
          Complete seu cadastro
        </p>
        <span className="text-zinc-500 text-xs font-bold">
          {completed}/{total}
        </span>
      </div>

      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FFD300] rounded-full transition-all duration-500"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {items.map(item => (
          <button
            key={item.id}
            onClick={item.done ? undefined : item.action}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              item.done ? 'bg-emerald-500/5 cursor-default' : 'bg-zinc-800/50 hover-real:bg-zinc-800 cursor-pointer'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                item.done ? 'bg-emerald-500/20' : 'bg-zinc-700/50'
              }`}
            >
              {item.done ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-zinc-500">{item.icon}</span>
              )}
            </div>
            <span className={`text-sm ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
