
"use client";

import { useMemo, useState, useTransition } from 'react';
import { BarChart, Fuel, Car, DollarSign, Map, TrendingUp, Clock, Zap, Loader2, CalendarDays, Hourglass, Route, GripVertical, Lock, Info, Check } from 'lucide-react';
import { ReportsFilter } from './reports-filter';
import { getReportData, ReportData } from '@/services/summary.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReportFilterValues } from '@/app/relatorios/actions';
import dynamic from 'next/dynamic';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { updateUser } from '@/services/auth.service';
import { differenceInDays, parseISO, isBefore, addDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const DraggableCard = ({ id, title, description, children, onPointerDown, ...props }: { id: string, title: string, description: string, children: React.ReactNode, onPointerDown: (e: React.PointerEvent) => void }) => {
    return (
        <Reorder.Item value={id} dragListener={false} {...props}>
             <Card className="w-full h-full cursor-grab active:cursor-grabbing" onPointerDown={onPointerDown}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                         <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <CardTitle className="font-headline text-lg">{title}</CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </Reorder.Item>
    );
};

const allStats = [
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

const mandatoryCards = ['lucro', 'ganho', 'combustivel'];

export function ReportsClient() {
  const { user, refreshUser } = useAuth();
  const [isSaving, startSavingTransition] = useTransition();

  const [cardOrder, setCardOrder] = useState<string[]>(
    user?.preferences?.dashboardCardOrder || [...mandatoryCards, allStats.find(s => !mandatoryCards.includes(s.id))!.id]
  );
  
  const controls = useDragControls();

  const handleSaveLayout = async () => {
    startSavingTransition(async () => {
      if(user) {
        // Lógica de restrição para plano gratuito
        if (!user.isPremium) {
            const lastChange = user.preferences.lastFreebieChangeDate;
            if(lastChange && isBefore(new Date(), addDays(new Date(lastChange), 7))){
                toast({
                    title: "Aguarde para trocar novamente",
                    description: "Você só pode alterar seu card opcional uma vez a cada 7 dias.",
                    variant: "destructive",
                });
                return;
            }
        }

        await updateUser(user.id, { 
            ...user, 
            preferences: { 
                ...user.preferences, 
                dashboardCardOrder: cardOrder,
                lastFreebieChangeDate: !user.isPremium ? new Date().toISOString() : user.preferences.lastFreebieChangeDate,
            }
        });
        await refreshUser();
        toast({
            title: <div className="flex items-center gap-2"><Check className="h-5 w-5"/><span>Layout Salvo!</span></div>,
            description: "Suas preferências de visualização foram salvas.",
            variant: 'success'
        });
      }
    });
  }

  const handleSelectOptionalCard = (cardId: string) => {
    if (user?.isPremium) return; // Não se aplica a premium
    
    // Mantém os 3 obrigatórios e substitui o opcional
    const newOrder = [...mandatoryCards, cardId];
    setCardOrder(newOrder);
  }


  if (!user) return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const optionalCards = allStats.filter(stat => !mandatoryCards.includes(stat.id));
  const currentOptionalCardId = cardOrder.find(id => !mandatoryCards.includes(id));

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-xl">Dashboard Cards</CardTitle>
                    <CardDescription>Organize os cards principais que aparecem no seu Dashboard.</CardDescription>
                </div>
                <Button onClick={handleSaveLayout} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Salvar Layout
                </Button>
            </CardHeader>
            <CardContent>
                {!user.isPremium && (
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Plano Gratuito</AlertTitle>
                        <AlertDescription>
                            Você pode escolher 1 card opcional para exibir além dos 3 cards padrão. Esta escolha pode ser alterada a cada 7 dias.
                        </AlertDescription>
                    </Alert>
                )}

                <h3 className="font-semibold mb-2">Cards Visíveis</h3>
                <Reorder.Group
                    as="div"
                    axis="y"
                    values={cardOrder}
                    onReorder={setCardOrder}
                    className="space-y-4"
                >
                    {cardOrder.map(id => {
                        const cardInfo = allStats.find(c => c.id === id);
                        return cardInfo ? (
                            <DraggableCard 
                                key={id} 
                                id={id}
                                title={cardInfo.title}
                                description=""
                                onPointerDown={(e) => controls.start(e)}
                            >
                                <StatsCard {...cardInfo} />
                            </DraggableCard>
                        ) : null
                    })}
                </Reorder.Group>

                <div className="mt-8">
                    <h3 className="font-semibold mb-2">Cards Opcionais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {optionalCards.map(card => (
                            <Card key={card.id} className={`relative p-2 border-2 ${currentOptionalCardId === card.id ? 'border-primary' : 'border-dashed'}`}>
                                {!user.isPremium && currentOptionalCardId !== card.id && <div className="absolute inset-0 bg-secondary/80 z-10 flex items-center justify-center rounded-lg"><Lock className="h-6 w-6 text-foreground/50"/></div>}
                                <StatsCard {...card} />
                                {currentOptionalCardId !== card.id && (
                                     <Button 
                                        size="sm" 
                                        className="absolute bottom-2 right-2 z-20"
                                        onClick={() => handleSelectOptionalCard(card.id)}
                                        disabled={!user.isPremium && currentOptionalCardId !== undefined && currentOptionalCardId !== card.id}
                                    >
                                        {!user.isPremium ? 'Escolher este' : 'Adicionar'}
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
