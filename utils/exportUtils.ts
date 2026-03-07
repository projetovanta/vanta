/**
 * exportUtils — CSV, PDF e Excel para relatórios financeiros e listas.
 */
// Dynamic imports — exceljs e jspdf (~300KB) só carregam quando o usuário exporta

// ── CSV ──────────────────────────────────────────────────────────────────────

export const exportCSV = (filename: string, headers: string[], rows: string[][]): void => {
  const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── PDF ──────────────────────────────────────────────────────────────────────

interface PDFOptions {
  titulo: string;
  subtitulo?: string;
  headers: string[];
  rows: string[][];
  resumo?: { label: string; valor: string }[];
}

export const exportPDF = async ({ titulo, subtitulo, headers, rows, resumo }: PDFOptions): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VANTA', margin, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    pageW - margin,
    y,
    { align: 'right' },
  );
  y += 10;

  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, margin, y);
  y += 6;
  if (subtitulo) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, margin, y);
    y += 6;
  }

  // Resumo KPIs
  if (resumo && resumo.length > 0) {
    y += 4;
    doc.setFontSize(8);
    for (const item of resumo) {
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.label}:`, margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(item.valor, margin + 50, y);
      y += 5;
    }
    y += 4;
  }

  // Linha separadora
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Tabela — header
  const colW = (pageW - margin * 2) / headers.length;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 3, pageW - margin * 2, 6, 'F');
  headers.forEach((h, i) => {
    doc.text(h, margin + i * colW + 2, y);
  });
  y += 6;

  // Tabela — rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  for (const row of rows) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    row.forEach((cell, i) => {
      const text = (cell ?? '').substring(0, 30);
      doc.text(text, margin + i * colW + 2, y);
    });
    y += 4.5;
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`VANTA — Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, margin, 290);
    doc.text(`Página ${p}/${totalPages}`, pageW - margin, 290, { align: 'right' });
  }

  doc.save(`${titulo.replace(/\s+/g, '_').toLowerCase()}.pdf`);
};

// ── Excel (.xlsx) ─────────────────────────────────────────────────────────────

export interface ExcelSheet {
  nome: string; // nome da aba (max 31 chars)
  headers: string[];
  rows: (string | number)[][];
}

export const exportExcel = async (filename: string, sheets: ExcelSheet[]): Promise<void> => {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const ws = wb.addWorksheet(sheet.nome.substring(0, 31));

    // Header row
    ws.addRow(sheet.headers);
    ws.getRow(1).font = { bold: true };

    // Data rows
    for (const row of sheet.rows) {
      ws.addRow(row);
    }

    // Auto-width básico
    ws.columns.forEach((col, i) => {
      const maxLen = Math.max(sheet.headers[i]?.length ?? 0, ...sheet.rows.map(r => String(r[i] ?? '').length));
      col.width = Math.min(maxLen + 2, 40);
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
