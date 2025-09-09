
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportData } from '@/services/summary.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';

// Adiciona a interface para a API do autoTable no jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const getPeriodString = (filters: ReportFilterValues): string => {
    switch (filters.type) {
        case 'today': return `Hoje (${format(new Date(), 'dd/MM/yyyy')})`;
        case 'thisWeek': return 'Esta Semana';
        case 'thisMonth': return `Este Mês (${format(new Date(), 'MMMM yyyy', { locale: ptBR })})`;
        case 'specificMonth': return `${format(new Date(filters.year!, filters.month!), 'MMMM yyyy', { locale: ptBR })}`;
        case 'specificYear': return `Ano de ${filters.year}`;
        case 'custom':
            if (filters.dateRange?.from && filters.dateRange?.to) {
                return `De ${format(filters.dateRange.from, 'dd/MM/yy')} a ${format(filters.dateRange.to, 'dd/MM/yy')}`;
            } else if (filters.dateRange?.from) {
                return `Dia ${format(filters.dateRange.from, 'dd/MM/yyyy')}`;
            }
            return 'Período Personalizado';
        case 'all': return 'Todo o Período';
        default: return 'Relatório';
    }
};

export const generatePdf = (data: ReportData, filters: ReportFilterValues) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    let y = 15; // Posição vertical inicial

    // --- Título ---
    doc.setFontSize(18);
    doc.text('Relatório Financeiro - Uber Cash', 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Período: ${getPeriodString(filters)}`, 14, y);
    y += 10;
    
    // --- Resumo Geral ---
    doc.setFontSize(14);
    doc.text('Resumo Geral do Período', 14, y);
    y += 7;

    const summaryData = [
        ['Lucro Líquido', formatCurrency(data.totalLucro), 'Ganhos Brutos', formatCurrency(data.totalGanho)],
        ['Total Despesas', formatCurrency(data.totalGastos), 'Dias Trabalhados', data.diasTrabalhados],
        ['Total KM Rodados', `${data.totalKm.toFixed(1)} km`, 'Total Horas', `${data.totalHoras.toFixed(1)} h`],
        ['Ganho por KM', formatCurrency(data.ganhoPorKm), 'Ganho por Hora', formatCurrency(data.ganhoPorHora)],
        ['Total Viagens', data.totalViagens, 'Eficiência Média', `${data.eficiencia.toFixed(2)} km/L`],
    ];

    doc.autoTable({
        startY: y,
        body: summaryData,
        theme: 'grid',
        styles: {
            cellPadding: 2,
            fontSize: 10,
        },
        headStyles: {
            fillColor: [22, 163, 74]
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { fontStyle: 'bold' }
        }
    });

    y = doc.autoTable.previous.finalY + 10;

    // --- Tabela de Ganhos por Categoria ---
    if (data.earningsByCategory.length > 0) {
        if (y > pageHeight - 40) { doc.addPage(); y = 15; }
        doc.setFontSize(14);
        doc.text('Detalhes de Ganhos e Viagens', 14, y);
        y += 7;

        const earningsBody = data.earningsByCategory.map(item => {
            const trips = data.tripsByCategory.find(t => t.name === item.name)?.total || 0;
            return [item.name, formatCurrency(item.total), trips];
        });

        doc.autoTable({
            startY: y,
            head: [['Categoria', 'Total Ganhos', 'Total Viagens']],
            body: earningsBody,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246]
            },
        });
        y = doc.autoTable.previous.finalY + 10;
    }
    
     // --- Tabela de Despesas ---
    if (data.fuelExpenses.length > 0 || data.maintenance.totalSpent > 0) {
        if (y > pageHeight - 40) { doc.addPage(); y = 15; }
        doc.setFontSize(14);
        doc.text('Detalhes de Despesas', 14, y);
        y += 7;

        const expensesBody: (string | number)[][] = data.fuelExpenses.map(item => [
            `Combustível: ${item.type}`, 
            formatCurrency(item.total)
        ]);
        
        if (data.maintenance.totalSpent > 0) {
            expensesBody.push(['Manutenção', formatCurrency(data.maintenance.totalSpent)]);
        }

        doc.autoTable({
            startY: y,
            head: [['Tipo de Despesa', 'Total Gasto']],
            body: expensesBody,
            theme: 'striped',
            headStyles: {
                fillColor: [220, 38, 38]
            },
        });
        y = doc.autoTable.previous.finalY + 10;
    }

    // --- Rodapé ---
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
            14,
            pageHeight - 10
        );
    }
    
    // --- Salvar o PDF ---
    const fileName = `Relatorio_UberCash_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
};
