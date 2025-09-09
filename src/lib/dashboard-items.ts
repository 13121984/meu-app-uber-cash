
import { DollarSign, Fuel, Car, CalendarDays, Hourglass, Route, TrendingUp, Zap, Map, Clock, PieChart, BarChart3, LineChart, CandlestickChart, Wrench } from "lucide-react";

export const allStats = [
    { id: 'lucro', title: "Lucro Líquido", value: 123.45, icon: DollarSign, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-500" },
    { id: 'ganho', title: "Ganhos Brutos", value: 234.56, icon: DollarSign, isCurrency: true, iconBg: "bg-primary/20", iconColor: "text-primary" },
    { id: 'combustivel', title: "Combustível", value: 56.78, icon: Fuel, isCurrency: true, iconBg: "bg-red-500/20", iconColor: "text-red-500" },
    { id: 'viagens', title: "Viagens", value: 15, icon: Car, iconBg: "bg-blue-500/20", iconColor: "text-blue-500" },
    { id: 'dias', title: "Dias Trabalhados", value: 1, icon: CalendarDays, iconBg: "bg-primary/20", iconColor: "text-primary" },
    { id: 'mediaHoras', title: "Média de Horas/Dia", value: 8.5, icon: Hourglass, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-500", precision: 1 },
    { id: 'mediaKm', title: "Média de KM/Dia", value: 150, icon: Route, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-500" },
    { id: 'ganhoHora', title: "Ganho/Hora", value: 27.60, isCurrency: true, icon: TrendingUp, iconBg: "bg-green-500/20", iconColor: "text-green-500", precision: 2 },
    { id: 'ganhoKm', title: "Ganho/KM", value: 1.56, isCurrency: true, icon: TrendingUp, iconBg: "bg-blue-500/20", iconColor: "text-blue-500", precision: 2 },
    { id: 'eficiencia', title: "Eficiência Média", value: 10.5, icon: Zap, unit: "km/L", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-500", precision: 2 },
    { id: 'kmRodados', title: "KM Rodados", value: 150.5, icon: Map, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-500" },
    { id: 'horasTrabalhadas', title: "Horas Trabalhadas", value: 8.5, icon: Clock, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-500", precision: 1 },
];

export const mandatoryCards = ['lucro', 'ganho', 'combustivel'];

export const allCharts = [
  { id: 'earningsComposition', title: "Composição de Ganhos", description: "Distribuição do seu faturamento bruto no período.", icon: PieChart, isMandatory: true },
  { id: 'profitEvolution', title: "Evolução do Lucro", description: "Veja a tendência do seu lucro ao longo do tempo.", icon: LineChart, isMandatory: false },
  { id: 'earningsByCategory', title: "Ganhos por Categoria", description: "Compare o desempenho de cada app ou serviço.", icon: BarChart3, isMandatory: false },
  { id: 'tripsByCategory', title: "Viagens por Categoria", description: "Analise a quantidade de viagens por plataforma.", icon: BarChart3, isMandatory: false },
  { id: 'maintenance', title: "Resumo de Manutenção", description: "Acompanhe seus gastos com manutenção no período.", icon: Wrench, isMandatory: false },
  { id: 'fuelExpenses', title: "Despesas com Combustível", description: "Veja quanto gastou com cada tipo de combustível.", icon: Fuel, isMandatory: false},
  { id: 'dailyTrips', title: "Viagens por Dia", description: "Acompanhe o volume de corridas ao longo dos dias.", icon: LineChart, isMandatory: false},
  { id: 'averageEarningPerHour', title: "Ganho Médio por Hora (por Categoria)", description: "Compare a rentabilidade por hora de cada serviço.", icon: BarChart3, isMandatory: false},
  { id: 'averageEarningPerTrip', title: "Ganho Médio por Viagem (por Categoria)", description: "Entenda qual serviço paga melhor por cada corrida.", icon: BarChart3, isMandatory: false},
];

export const mandatoryCharts = ['earningsComposition'];
