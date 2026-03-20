import React, { useCallback } from 'react';
import { Download } from 'lucide-react';

interface Props {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportButton({ data, filename, label = 'Exportar' }: Props) {
  const handleExport = useCallback(() => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const headerRow = headers.map(escapeCSVValue).join(',');
    const rows = data.map(row => headers.map(h => escapeCSVValue(row[h])).join(','));
    const csv = [headerRow, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, filename]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={data.length === 0}
      className="flex items-center gap-1.5 bg-zinc-900/40 border border-white/5 text-zinc-400 rounded-xl px-3 py-2 text-[0.625rem] font-bold uppercase tracking-widest hover-real:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={12} />
      {label}
    </button>
  );
}
