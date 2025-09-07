

"use client";

import { useMemo, useState, useTransition } from 'react';
import { GripVertical, Lock, Info, Check, ArrowUp, ArrowDown, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { updateUser } from '@/services/auth.service';
import { addDays, formatDistanceToNow, isAfter, sub } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { allStats, mandatoryCards, allCharts, mandatoryCharts } from '@/lib/dashboard-items';
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';


const DraggableItem = ({ id, title, children, onMove, isFirst, isLast }: { id: string; title: string; children: React.ReactNode; onMove: (direction: 'up' | 'down') => void; isFirst: boolean; isLast: boolean; }) => {
    return (
        <div className="flex items-center gap-2">
             <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove('up')} disabled={isFirst}>
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMove('down')} disabled={isLast}>
                    <ArrowDown className="h-4 w-4" />
                </Button>
            </div>
            <Card className="w-full">
                <CardHeader className="pb-2">
                     <CardTitle className="font-headline text-base flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};


export function ReportsClient() {
  const { user, refreshUser } = useAuth();
  const [isSaving, startSavingTransition] = useTransition();
  
  const getInitialOrder = (itemType: 'cards' | 'charts'): string[] => {
      if (!user) return [];

      const mandatoryItems = itemType === 'cards' ? mandatoryCards : mandatoryCharts;
      const allItems = itemType === 'cards' ? allStats : allCharts;
      const userOrder = user.preferences?.[itemType === 'cards' ? 'dashboardCardOrder' : 'reportChartOrder'];

      if (user.isPremium) {
          return userOrder && userOrder.length > 0 ? userOrder : allItems.map(i => i.id);
      }
      
      const defaultOptional = allItems.find(i => !mandatoryItems.includes(i.id))!.id;
      const optionalItem = userOrder?.find(id => !mandatoryItems.includes(id)) || defaultOptional;
      
      return userOrder && userOrder.length === (mandatoryItems.length + (optionalItem ? 1 : 0)) ? userOrder : [...mandatoryItems, optionalItem];
  };

  const [cardOrder, setCardOrder] = useState<string[]>(() => getInitialOrder('cards'));
  const [chartOrder, setChartOrder] = useState<string[]>(() => getInitialOrder('charts'));
  
  // State to track the *originally saved* optional item
  const [savedOptionalCard, setSavedOptionalCard] = useState(() => cardOrder.find(id => !mandatoryCards.includes(id)));
  const [savedOptionalChart, setSavedOptionalChart] = useState(() => chartOrder.find(id => !mandatoryCharts.includes(id)));


  const handleMoveItem = (itemId: string, direction: 'up' | 'down', itemType: 'cards' | 'charts') => {
      const order = itemType === 'cards' ? cardOrder : chartOrder;
      const setOrder = itemType === 'cards' ? setCardOrder : setChartOrder;
      const index = order.indexOf(itemId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= order.length) return;
      
      const newOrder = [...order];
      [newOrder[index], newOrder[newIndex]] = [newOrder[index], newOrder[newIndex]];
      setOrder(newOrder);
  };
  
  const handleSaveLayout = async () => {
    startSavingTransition(async () => {
      if(!user) return;
      
      const newOptionalCard = cardOrder.find(id => !mandatoryCards.includes(id));
      const newOptionalChart = chartOrder.find(id => !mandatoryCharts.includes(id));

      const cardSwapped = newOptionalCard !== savedOptionalCard;
      const chartSwapped = newOptionalChart !== savedOptionalChart;
      const isSwapping = cardSwapped || chartSwapped;

      if (isSwapping && !user.isPremium) {
        const lastChange = user.preferences.lastFreebieChangeDate;
        if (lastChange) {
            const sevenDaysAgo = sub(new Date(), { days: 7 });
            if (isAfter(new Date(lastChange), sevenDaysAgo)) {
                toast({
                    title: "Aguarde para trocar novamente",
                    description: `Você só pode alterar seu item opcional a cada 7 dias. Próxima troca disponível ${formatDistanceToNow(addDays(new Date(lastChange), 7), { locale: ptBR, addSuffix: true })}.`,
                    variant: "destructive",
                });
                // Revert the visual state to the saved state
                setCardOrder(getInitialOrder('cards'));
                setChartOrder(getInitialOrder('charts'));
                return;
            }
        }
      }
      
      const newPreferences = { 
        ...user.preferences, 
        dashboardCardOrder: cardOrder,
        reportChartOrder: chartOrder,
        lastFreebieChangeDate: (isSwapping && !user.isPremium) ? new Date().toISOString() : user.preferences.lastFreebieChangeDate,
      };

      const result = await updateUser(user.id, { preferences: newPreferences });

      if (result.success) {
          await refreshUser();
          // Update the "saved" state after successful save
          setSavedOptionalCard(newOptionalCard);
          setSavedOptionalChart(newOptionalChart);
          toast({
              title: <div className="flex items-center gap-2"><Check className="h-5 w-5"/><span>Layout Salvo!</span></div>,
              description: "Suas preferências de visualização foram salvas.",
              variant: 'success'
          });
      } else {
           toast({
              title: "Erro ao Salvar",
              description: result.error,
              variant: "destructive",
          });
      }
    });
  }

  const handleSelectItem = (itemId: string, itemType: 'cards' | 'charts') => {
      const setOrder = itemType === 'cards' ? setCardOrder : setChartOrder;
      const mandatoryItems = itemType === 'cards' ? mandatoryCards : mandatoryCharts;

      setOrder(prevOrder => {
          if (user?.isPremium) {
              return prevOrder.includes(itemId) ? prevOrder.filter(id => id !== itemId) : [...prevOrder, itemId];
          } else {
              const optionalItemIndex = prevOrder.findIndex(id => !mandatoryItems.includes(id));
              const newOrder = [...prevOrder];
              if (optionalItemIndex > -1) {
                  newOrder[optionalItemIndex] = itemId;
              } else {
                  newOrder.push(itemId);
              }
              return newOrder;
          }
      });
  }

  if (!user) return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const renderSection = (itemType: 'cards' | 'charts') => {
      const allItems = itemType === 'cards' ? allStats : allCharts;
      const mandatoryItems = itemType === 'cards' ? mandatoryCards : mandatoryCharts;
      const currentOrder = itemType === 'cards' ? cardOrder : chartOrder;
      
      const visibleItems = currentOrder.map(id => allItems.find(item => item.id === id)).filter(Boolean) as (typeof allItems);
      const optionalItems = allItems.filter(item => !mandatoryItems.includes(item.id));

      return (
          <>
            {!user.isPremium && (
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Plano Gratuito</AlertTitle>
                    <AlertDescription>
                        Você pode escolher 1 item opcional e trocá-lo a cada 7 dias. A ordem de todos os itens visíveis pode ser alterada a qualquer momento.
                    </AlertDescription>
                </Alert>
            )}

            <h3 className="font-semibold mb-4">Itens Visíveis no Dashboard</h3>
            <div className="space-y-4">
                {visibleItems.map((itemInfo, index) => (
                    <DraggableItem 
                        key={itemInfo.id} 
                        id={itemInfo.id}
                        title={itemInfo.title}
                        onMove={(dir) => handleMoveItem(itemInfo.id, dir, itemType)}
                        isFirst={index === 0}
                        isLast={index === visibleItems.length - 1}
                    >
                        <StatsCard {...itemInfo} value={0} isPreview={true} />
                    </DraggableItem>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="font-semibold mb-2">Itens Opcionais</h3>
                 <p className="text-sm text-muted-foreground mb-4">
                   {user.isPremium ? "Clique para adicionar ou remover do seu dashboard." : "Clique para substituir o seu item opcional."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {optionalItems.map(item => {
                        const isVisible = currentOrder.includes(item.id);
                        
                        return (
                             <Card key={item.id} className={`relative p-2 border-2 ${isVisible && !user.isPremium ? 'border-primary' : 'border-dashed'}`}>
                                {user.isPremium && isVisible && <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1"><Check className="h-3 w-3"/></div>}
                                
                                <StatsCard {...item} value={0} isPreview={true} />

                                <Button 
                                    variant={isVisible ? "secondary" : "default"}
                                    size="sm" className="w-full mt-2"
                                    onClick={() => handleSelectItem(item.id, itemType)}
                                    disabled={isSaving || (isVisible && !user.isPremium)}
                                >
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {isVisible 
                                        ? (user.isPremium ? 'Ocultar' : 'Selecionado')
                                        : (user.isPremium ? 'Mostrar' : 'Selecionar')
                                    }
                                </Button>
                            </Card>
                        )
                    })}
                </div>
            </div>
          </>
      )
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-xl">Personalizar Layout</CardTitle>
                    <CardDescription>Organize os cards e gráficos que aparecem no seu Dashboard.</CardDescription>
                </div>
                <Button onClick={() => handleSaveLayout()} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Salvar Ordem
                </Button>
            </CardHeader>
             <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="cards">
                        <AccordionTrigger className="text-lg font-semibold">Organizar Cards</AccordionTrigger>
                        <AccordionContent className="pt-4">
                            {renderSection('cards')}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="charts">
                        <AccordionTrigger className="text-lg font-semibold">Organizar Gráficos</AccordionTrigger>
                        <AccordionContent className="pt-4">
                            {renderSection('charts')}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    </div>
  );
}

    