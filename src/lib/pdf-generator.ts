
"use client";

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportData } from '@/services/summary.service';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { mandatoryCards, allStats } from './dashboard-items';
import type { Plan } from '@/services/auth.service';

// A interface foi movida para o arquivo .d.ts global para evitar conflitos.

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

const getValueForStat = (id: string, data: ReportData) => {
    switch(id) {
        case 'lucro': return formatCurrency(data.totalLucro);
        case 'ganho': return formatCurrency(data.totalGanho);
        case 'combustivel': return formatCurrency(data.totalCombustivel);
        case 'viagens': return data.totalViagens.toString();
        case 'dias': return data.diasTrabalhados.toString();
        case 'mediaHoras': return `${data.mediaHorasPorDia.toFixed(1)} h`;
        case 'mediaKm': return `${data.mediaKmPorDia.toFixed(1)} km`;
        case 'ganhoHora': return formatCurrency(data.ganhoPorHora);
        case 'ganhoKm': return formatCurrency(data.ganhoPorKm);
        case 'eficiencia': return `${data.eficiencia.toFixed(2)} km/L`;
        case 'kmRodados': return `${data.totalKm.toFixed(1)} km`;
        case 'horasTrabalhadas': return `${data.totalHoras.toFixed(1)} h`;
        default: return 'N/A';
    }
}

export const generatePdf = async (
    data: ReportData, 
    filters: ReportFilterValues,
    plan: Plan,
    chartElements: { [key: string]: HTMLElement | null }
) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
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

    const isPro = plan === 'pro' || plan === 'autopilot';
    const statIdsToShow = isPro ? allStats.map(s => s.id) : mandatoryCards;
    
    const summaryData = [];
    const statsToDisplay = allStats.filter(stat => statIdsToShow.includes(stat.id));

    for (let i = 0; i < statsToDisplay.length; i += 2) {
        const row = [];
        row.push(statsToDisplay[i].title);
        row.push(getValueForStat(statsToDisplay[i].id, data));
        if (i + 1 < statsToDisplay.length) {
            row.push(statsToDisplay[i + 1].title);
            row.push(getValueForStat(statsToDisplay[i + 1].id, data));
        }
        summaryData.push(row);
    }

    doc.autoTable({
        startY: y,
        body: summaryData,
        theme: 'grid',
        styles: { cellPadding: 2, fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] },
        columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
    });

    y = doc.autoTable.previous.finalY + 10;

    // --- Inserir Gráficos ---
    doc.setFontSize(14);
    if(y > pageHeight - 60) { doc.addPage(); y = 15; }
    doc.text('Gráficos de Performance', 14, y);
    y += 7;

    for (const key in chartElements) {
        const element = chartElements[key];
        if (element) {
            try {
                const canvas = await html2canvas(element, { backgroundColor: '#111827' }); // Use um fundo para evitar transparência
                const imgData = canvas.toDataURL('image/png');
                
                const imgWidth = 180;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (y + imgHeight > pageHeight - 20) {
                    doc.addPage();
                    y = 15;
                }
                
                doc.addImage(imgData, 'PNG', 14, y, imgWidth, imgHeight);
                y += imgHeight + 10;

            } catch (e) {
                console.error(`Error capturing chart ${key}:`, e);
            }
        }
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
