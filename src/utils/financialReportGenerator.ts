import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateDREPDF(data: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${data.period}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Receitas
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('RECEITAS', 20, yPos);
  yPos += 8;

  doc.setFontSize(12);
  (doc as any).autoTable({
    startY: yPos,
    head: [['Descrição', 'Valor']],
    body: [
      ['Receitas Totais', `R$ ${data.revenue.toFixed(2).replace('.', ',')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 11 },
    margin: { left: 20, right: 20 },
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Despesas
  doc.setFontSize(14);
  doc.text('DESPESAS', 20, yPos);
  yPos += 8;

  const expensesRows = [
    ['Despesas Operacionais', `R$ ${data.expenses.toFixed(2).replace('.', ',')}`],
  ];

  if (data.expensesByCategory) {
    Object.entries(data.expensesByCategory).forEach(([cat, val]: [string, any]) => {
      expensesRows.push([`  - ${cat.charAt(0).toUpperCase() + cat.slice(1)}`, `R$ ${val.toFixed(2).replace('.', ',')}`]);
    });
  }

  expensesRows.push(
    ['Salários', `R$ ${data.salaries.toFixed(2).replace('.', ',')}`],
    ['Impostos', `R$ ${data.taxes.toFixed(2).replace('.', ',')}`],
  );

  (doc as any).autoTable({
    startY: yPos,
    head: [['Descrição', 'Valor']],
    body: expensesRows,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 11 },
    margin: { left: 20, right: 20 },
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Resultado
  doc.setFontSize(14);
  doc.setTextColor(data.profit >= 0 ? [34, 197, 94] : [239, 68, 68]);
  doc.text('RESULTADO', 20, yPos);
  yPos += 8;

  (doc as any).autoTable({
    startY: yPos,
    head: [['Descrição', 'Valor']],
    body: [
      ['Lucro Líquido', `R$ ${data.profit.toFixed(2).replace('.', ',')}`],
      ['Margem de Lucro', `${data.profitMargin.toFixed(2)}%`],
    ],
    theme: 'striped',
    headStyles: { 
      fillColor: data.profit >= 0 ? [59, 130, 246] : [239, 68, 68], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold' 
    },
    styles: { fontSize: 12, fontStyle: 'bold' },
    margin: { left: 20, right: 20 },
  });

  doc.save(`DRE-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateCashFlowPDF(data: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text('FLUXO DE CAIXA', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Tabela
  const tableData = data.months?.map((m: any) => [
    m.month,
    `R$ ${m.revenue.toFixed(2).replace('.', ',')}`,
    `R$ ${m.expenses.toFixed(2).replace('.', ',')}`,
    `R$ ${m.net.toFixed(2).replace('.', ',')}`,
  ]) || [];

  if (data.total) {
    tableData.push([
      'TOTAL',
      `R$ ${data.total.revenue.toFixed(2).replace('.', ',')}`,
      `R$ ${data.total.expenses.toFixed(2).replace('.', ',')}`,
      `R$ ${data.total.net.toFixed(2).replace('.', ',')}`,
    ]);
  }

  (doc as any).autoTable({
    startY: yPos,
    head: [['Mês', 'Entradas', 'Saídas', 'Saldo Líquido']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      1: { halign: 'right', cellWidth: 50 },
      2: { halign: 'right', cellWidth: 50 },
      3: { halign: 'right', cellWidth: 50 },
    },
  });

  doc.save(`FluxoCaixa-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateProfitReportPDF(data: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text('RELATÓRIO DE LUCRO MENSAL/ANUAL', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Tabela
  const tableData = data.months?.map((m: any) => [
    m.month,
    `R$ ${m.revenue.toFixed(2).replace('.', ',')}`,
    `R$ ${m.expenses.toFixed(2).replace('.', ',')}`,
    `R$ ${m.salaries.toFixed(2).replace('.', ',')}`,
    `R$ ${m.profit.toFixed(2).replace('.', ',')}`,
    `${m.margin.toFixed(2)}%`,
  ]) || [];

  if (data.total) {
    tableData.push([
      'TOTAL',
      `R$ ${data.total.revenue.toFixed(2).replace('.', ',')}`,
      `R$ ${data.total.expenses.toFixed(2).replace('.', ',')}`,
      `R$ ${data.total.salaries.toFixed(2).replace('.', ',')}`,
      `R$ ${data.total.profit.toFixed(2).replace('.', ',')}`,
      `${data.total.margin.toFixed(2)}%`,
    ]);
  }

  (doc as any).autoTable({
    startY: yPos,
    head: [['Mês', 'Receitas', 'Despesas', 'Salários', 'Lucro Líquido', 'Margem (%)']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 15, right: 15 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });

  doc.save(`RelatorioLucro-${new Date().toISOString().split('T')[0]}.pdf`);
}

