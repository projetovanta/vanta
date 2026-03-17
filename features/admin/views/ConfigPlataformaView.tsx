/**
 * ConfigPlataformaView — Master edita taxas e configurações da plataforma.
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { AdminViewHeader } from '../components/AdminViewHeader';
import { useToast, ToastContainer } from '../../../components/Toast';
import { platformConfigService, type PlatformConfigItem } from '../services/platformConfigService';

export const ConfigPlataformaView: React.FC<{
  onBack: () => void;
  currentUserId: string;
}> = ({ onBack, currentUserId }) => {
  const { toasts, dismiss, toast } = useToast();
  const [items, setItems] = useState<PlatformConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    platformConfigService.getAll().then(data => {
      if (cancelled) return;
      setItems(data);
      const vals: Record<string, string> = {};
      data.forEach(item => {
        vals[item.key] = item.value;
      });
      setValues(vals);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDisplay = (item: PlatformConfigItem, val: string): string => {
    if (item.tipo === 'percent') {
      const num = parseFloat(val);
      return isNaN(num) ? val : `${(num * 100).toFixed(1)}%`;
    }
    if (item.tipo === 'number') {
      const num = parseFloat(val);
      return isNaN(num) ? val : `R$ ${num.toFixed(2)}`;
    }
    return val;
  };

  const handleChange = (key: string, raw: string) => {
    setValues(prev => ({ ...prev, [key]: raw }));
  };

  const handleSave = async () => {
    setSaving(true);
    let ok = true;
    for (const item of items) {
      const newVal = values[item.key];
      if (newVal !== item.value) {
        const success = await platformConfigService.update(item.key, newVal, currentUserId);
        if (!success) ok = false;
      }
    }
    if (ok) {
      toast('sucesso', 'Configurações salvas');
      // Recarregar
      const data = await platformConfigService.getAll();
      setItems(data);
    } else {
      toast('erro', 'Erro ao salvar algumas configurações');
    }
    setSaving(false);
  };

  const hasChanges = items.some(item => values[item.key] !== item.value);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminViewHeader
        title="Configurações da Plataforma"
        kicker="Taxas e parâmetros"
        onBack={onBack}
        actions={[
          {
            icon: saving ? Loader2 : Save,
            label: saving ? 'Salvando...' : 'Salvar',
            onClick: handleSave,
            disabled: saving || !hasChanges,
            color: hasChanges ? '#FFD300' : undefined,
          },
        ]}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size="1.25rem" className="text-zinc-400 animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-xs">Edite os valores abaixo. As mudanças valem pra toda a plataforma.</p>

            {items.map(item => (
              <div key={item.key} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-bold">{item.label || item.key}</p>
                    {item.descricao && <p className="text-zinc-500 text-xs">{item.descricao}</p>}
                  </div>
                  <span className="text-[#FFD300] text-sm font-bold">
                    {formatDisplay(item, values[item.key] ?? item.value)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.tipo === 'percent' ? (
                    <>
                      <input
                        value={String(parseFloat(values[item.key] ?? '0') * 100)}
                        onChange={e => {
                          const pct = parseFloat(e.target.value);
                          if (!isNaN(pct)) handleChange(item.key, String(pct / 100));
                        }}
                        inputMode="decimal"
                        className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                      />
                      <span className="text-zinc-400 text-sm">%</span>
                    </>
                  ) : (
                    <>
                      <input
                        value={values[item.key] ?? ''}
                        onChange={e => handleChange(item.key, e.target.value)}
                        inputMode="decimal"
                        className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                      />
                      {item.tipo === 'number' && <span className="text-zinc-400 text-sm">R$</span>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};
