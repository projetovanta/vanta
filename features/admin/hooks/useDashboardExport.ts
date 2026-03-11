/**
 * Hook para exportar dados do dashboard como CSV.
 */

import { useCallback } from 'react';

function escapeCsvValue(val: unknown): string {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCsvValue).join(',');
  const rows = data.map(row => headers.map(h => escapeCsvValue(row[h])).join(','));
  return [headerRow, ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useDashboardExport() {
  const exportCsv = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const csv = toCsv(data);
    downloadCsv(csv, filename);
  }, []);

  return { exportCsv };
}
