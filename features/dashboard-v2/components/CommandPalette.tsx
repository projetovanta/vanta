import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search,
  LayoutDashboard,
  BarChart3,
  Star,
  Users,
  Bell,
  Compass,
  Crown,
  Calendar,
  Banknote,
  Settings,
  FileCheck,
  ClipboardList,
  Handshake,
  Tag,
  ShieldPlus,
  Activity,
  HelpCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  User,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';

interface CommandItem {
  id: string;
  label: string;
  section: string;
  icon: typeof Search;
  keywords: string;
}

const COMMANDS: CommandItem[] = [
  { id: 'DASHBOARD', label: 'Dashboard', section: 'Home', icon: LayoutDashboard, keywords: 'inicio home dashboard' },
  {
    id: 'FINANCEIRO_MASTER',
    label: 'Financeiro',
    section: 'Dados',
    icon: Banknote,
    keywords: 'financeiro receita dinheiro saque',
  },
  {
    id: 'PRODUCT_ANALYTICS',
    label: 'Analytics',
    section: 'Dados',
    icon: TrendingUp,
    keywords: 'analytics metricas dados',
  },
  {
    id: 'INTELIGENCIA',
    label: 'Inteligência',
    section: 'Dados',
    icon: Sparkles,
    keywords: 'inteligencia insights tips',
  },
  { id: 'RELATORIO_MASTER', label: 'Relatórios', section: 'Dados', icon: BarChart3, keywords: 'relatorios exportar' },
  { id: 'COMUNIDADES', label: 'Comunidades', section: 'Ações', icon: Calendar, keywords: 'comunidade casa bar espaco' },
  { id: 'MEUS_EVENTOS', label: 'Eventos', section: 'Ações', icon: Calendar, keywords: 'evento criar festa show' },
  { id: 'NOTIFICACOES', label: 'Notificações', section: 'Ações', icon: Bell, keywords: 'notificacao push enviar' },
  {
    id: 'INDICA',
    label: 'Vanta Indica',
    section: 'Ações',
    icon: Compass,
    keywords: 'indica destaque card curadoria editorial',
  },
  {
    id: 'GESTAO_COMPROVANTES',
    label: 'Comprovantes',
    section: 'Ações',
    icon: FileCheck,
    keywords: 'comprovante meia entrada',
  },
  {
    id: 'CURADORIA_MV',
    label: 'Curadoria MV',
    section: 'MAIS VANTA',
    icon: Star,
    keywords: 'curadoria aprovar membro mais vanta',
  },
  {
    id: 'MEMBROS_GLOBAIS_MV',
    label: 'Membros MV',
    section: 'MAIS VANTA',
    icon: Users,
    keywords: 'membros mais vanta lista',
  },
  {
    id: 'CONVITES_MV',
    label: 'Convites MV',
    section: 'MAIS VANTA',
    icon: Crown,
    keywords: 'convites indicacao mais vanta',
  },
  {
    id: 'MAIS_VANTA_HUB',
    label: 'Config MAIS VANTA',
    section: 'MAIS VANTA',
    icon: Settings,
    keywords: 'config mais vanta parceiros deals cidades',
  },
  {
    id: 'PENDENTES',
    label: 'Eventos Pendentes',
    section: 'Ações',
    icon: ClipboardList,
    keywords: 'pendente aprovar evento',
  },
  { id: 'CATEGORIAS', label: 'Categorias', section: 'Config', icon: Tag, keywords: 'categoria tipo evento' },
  { id: 'CARGOS', label: 'Cargos', section: 'Config', icon: ShieldPlus, keywords: 'cargo role permissao' },
  {
    id: 'SOLICITACOES_PARCERIA',
    label: 'Parcerias',
    section: 'Config',
    icon: Handshake,
    keywords: 'parceria solicitacao produtor',
  },
  {
    id: 'DIAGNOSTICO',
    label: 'Diagnóstico',
    section: 'Config',
    icon: Activity,
    keywords: 'diagnostico sistema health',
  },
  { id: 'FAQ', label: 'FAQ', section: 'Config', icon: HelpCircle, keywords: 'faq ajuda perguntas' },
];

type DataResult = {
  id: string;
  label: string;
  subtitle: string;
  section: string;
  type: 'evento' | 'comunidade' | 'membro';
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDataSelect?: (type: 'evento' | 'comunidade' | 'membro', id: string) => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, onSelect, onDataSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [dataResults, setDataResults] = useState<DataResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const filtered =
    query.length === 0
      ? COMMANDS
      : COMMANDS.filter(
          c =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.keywords.toLowerCase().includes(query.toLowerCase()),
        );

  const allResults = useMemo(
    () => [
      ...filtered.map(f => ({ ...f, _isCommand: true as const })),
      ...dataResults.map(d => ({ ...d, _isCommand: false as const })),
    ],
    [filtered, dataResults],
  );

  // Busca dinâmica no Supabase
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setDataResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const q = query.toLowerCase();
      const results: DataResult[] = [];

      const [evRes, comRes, memRes] = await Promise.all([
        supabase.from('eventos_admin').select('id, nome, cidade').ilike('nome', `%${q}%`).limit(5),
        supabase.from('comunidades').select('id, nome, cidade').ilike('nome', `%${q}%`).limit(5),
        supabase.from('profiles').select('id, nome, email, cidade').ilike('nome', `%${q}%`).limit(5),
      ]);

      if (evRes.data) {
        for (const e of evRes.data) {
          results.push({
            id: e.id,
            label: e.nome,
            subtitle: e.cidade || 'Sem cidade',
            section: 'Eventos',
            type: 'evento',
          });
        }
      }
      if (comRes.data) {
        for (const c of comRes.data) {
          results.push({
            id: c.id,
            label: c.nome,
            subtitle: c.cidade || '',
            section: 'Comunidades',
            type: 'comunidade',
          });
        }
      }
      if (memRes.data) {
        for (const m of memRes.data) {
          results.push({
            id: m.id,
            label: m.nome || 'Sem nome',
            subtitle: m.cidade || m.email || '',
            section: 'Membros',
            type: 'membro',
          });
        }
      }

      setDataResults(results);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setDataResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(i => Math.min(i + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && allResults[selectedIdx]) {
        const item = allResults[selectedIdx];
        if (item._isCommand) {
          onSelect(item.id);
        } else if (onDataSelect) {
          onDataSelect((item as DataResult & { _isCommand: false }).type, item.id);
        }
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [allResults, selectedIdx, onSelect, onDataSelect, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[500] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0A0A0A]/95 backdrop-blur-2xl border border-[#FFD300]/15 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search size="1.125rem" className="text-zinc-500 shrink-0" />
          <input
            id="command-palette-search"
            name="command-palette-search"
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar tela, evento, membro, comunidade..."
            autoComplete="off"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-zinc-600"
          />
          {searching && <Loader2 size="0.875rem" className="text-zinc-500 animate-spin shrink-0" />}
          <kbd className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[0.5rem] font-bold rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto no-scrollbar py-2">
          {allResults.length === 0 && !searching ? (
            <p className="text-zinc-500 text-sm text-center py-8">Nenhum resultado</p>
          ) : (
            allResults.map((item, idx) => {
              const DATA_ICONS = { evento: Calendar, comunidade: MapPin, membro: User };
              const Icon = item._isCommand
                ? (item as CommandItem & { _isCommand: true }).icon
                : DATA_ICONS[(item as DataResult & { _isCommand: false }).type];
              const section = item._isCommand
                ? (item as CommandItem & { _isCommand: true }).section
                : (item as DataResult & { _isCommand: false }).section;
              const subtitle = item._isCommand ? section : (item as DataResult & { _isCommand: false }).subtitle;

              return (
                <button
                  key={`${item._isCommand ? 'cmd' : 'data'}-${item.id}`}
                  onClick={() => {
                    if (item._isCommand) {
                      onSelect(item.id);
                    } else if (onDataSelect) {
                      onDataSelect((item as DataResult & { _isCommand: false }).type, item.id);
                    }
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    idx === selectedIdx ? 'bg-[#FFD300]/10' : 'hover-real:bg-white/5'
                  }`}
                >
                  <Icon size="1rem" className={idx === selectedIdx ? 'text-[#FFD300]' : 'text-zinc-500'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${idx === selectedIdx ? 'text-white font-bold' : 'text-zinc-300'}`}>
                      {item.label}
                    </p>
                    <p className="text-[0.625rem] text-zinc-600 truncate">{subtitle}</p>
                  </div>
                  {!item._isCommand && (
                    <span className="text-[0.5rem] font-bold uppercase tracking-widest text-zinc-600 shrink-0">
                      {section}
                    </span>
                  )}
                  {idx === selectedIdx && (
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 text-[0.5rem] font-bold rounded border border-white/10 shrink-0">
                      ↵
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
