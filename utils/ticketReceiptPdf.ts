/**
 * ticketReceiptPdf — Gera PDF de comprovante de ingresso (SEM QR code).
 * QR fica exclusivo no app/Wallet por segurança.
 */

interface ReceiptData {
  nomeEvento: string;
  dataEvento: string;
  local: string;
  cidade: string;
  nomeComprador: string;
  variacao: string;
  valor: number;
  codigoPedido: string;
  dataCompra: string;
}

export const gerarComprovantePdf = async (data: ReceiptData): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  let y = 30;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VANTA', W / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Comprovante de Ingresso', W / 2, y, { align: 'center' });
  y += 15;

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, W - 20, y);
  y += 12;

  // Dados do evento
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.nomeEvento, W / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(data.dataEvento, W / 2, y, { align: 'center' });
  y += 6;
  doc.text(`${data.local} — ${data.cidade}`, W / 2, y, { align: 'center' });
  y += 15;

  // Dados da compra
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, W - 20, y);
  y += 10;

  const addRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(label, 25, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(value, W - 25, y, { align: 'right' });
    y += 8;
  };

  addRow('COMPRADOR', data.nomeComprador);
  addRow('TIPO', data.variacao);
  addRow('VALOR', `R$ ${data.valor.toFixed(2).replace('.', ',')}`);
  addRow('PEDIDO', data.codigoPedido);
  addRow('DATA DA COMPRA', data.dataCompra);

  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, W - 20, y);
  y += 15;

  // Aviso de segurança
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  const aviso =
    'Para entrar no evento, apresente seu ingresso no app VANTA. Este documento é apenas um comprovante de compra.';
  const linhas = doc.splitTextToSize(aviso, W - 50);
  doc.text(linhas, W / 2, y, { align: 'center' });

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('maisvanta.com', W / 2, 280, { align: 'center' });

  doc.save(`comprovante-${data.codigoPedido}.pdf`);
};
