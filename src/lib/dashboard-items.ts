
import { DollarSign, Fuel, Car, CalendarDays, Hourglass, Route, TrendingUp, Zap, Map, Clock } from "lucide-react";

export const allStats = [
    { id: 'lucro', title: "Lucro Líquido", value: 123.45, icon: DollarSign, isCurrency: true, iconBg: "bg-green-500/20", iconColor: "text-green-400" },
    { id: 'ganho', title: "Ganhos Brutos", value: 234.56, icon: DollarSign, isCurrency: true, iconBg: "bg-primary/20", iconColor: "text-primary" },
    { id: 'combustivel', title: "Combustível", value: 56.78, icon: Fuel, isCurrency: true, iconBg: "bg-red-500/20", iconColor: "text-red-400" },
    { id: 'viagens', title: "Viagens", value: 15, icon: Car, iconBg: "bg-blue-500/20", iconColor: "text-blue-400" },
    { id: 'dias', title: "Dias Trabalhados", value: 1, icon: CalendarDays, iconBg: "bg-sky-500/20", iconColor: "text-sky-400" },
    { id: 'mediaHoras', title: "Média de Horas/Dia", value: 8.5, icon: Hourglass, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 1 },
    { id: 'mediaKm', title: "Média de KM/Dia", value: 150, icon: Route, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { id: 'ganhoHora', title: "Ganho/Hora", value: 27.60, isCurrency: true, icon: TrendingUp, iconBg: "bg-green-500/20", iconColor: "text-green-400", precision: 2 },
    { id: 'ganhoKm', title: "Ganho/KM", value: 1.56, isCurrency: true, icon: TrendingUp, iconBg: "bg-blue-500/20", iconColor: "text-blue-400", precision: 2 },
    { id: 'eficiencia', title: "Eficiência Média", value: 10.5, icon: Zap, unit: "km/L", iconBg: "bg-yellow-500/20", iconColor: "text-yellow-400", precision: 2 },
    { id: 'kmRodados', title: "KM Rodados", value: 150.5, icon: Map, unit: "km", iconBg: "bg-purple-500/20", iconColor: "text-purple-400" },
    { id: 'horasTrabalhadas', title: "Horas Trabalhadas", value: 8.5, icon: Clock, unit: "h", iconBg: "bg-orange-500/20", iconColor: "text-orange-400", precision: 1 },
];

export const mandatoryCards = ['lucro', 'ganho', 'combustivel'];
