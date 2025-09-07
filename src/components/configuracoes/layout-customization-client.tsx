
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowUp, ArrowDown, Check, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { allCharts, mandatoryCharts, allStats, mandatoryCards } from '@/lib/dashboard-items';
import dynamic from 'next/dynamic';
import { updateUser } from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { add, isBefore } from 'date-fns';

const StatsCard = dynamic(() => import('../dashboard/stats-card').then(mod => mod.StatsCard), { ssr: false });

export function LayoutCustomizationClient() {
  const { user, loading, refreshUser } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [visibleCardIds, setVisibleCardIds] = useState<string[]>([]);
  const [selectedOptionalCardId, setSelectedOptionalCardId] = useState<string | null>(null);

  const [visibleChartIds, setVisibleChartIds] = useState<string[]>([]);
  const [selectedOptionalChartId, setSelectedOptionalChartId] = useState<string | null>(null);

  const lastChangeDate = useMemo(() => {
      return user?.preferences.lastFreebieChangeDate ? new Date(user.preferences.lastFreebieChangeDate) : null;
  }, [user]);

  const canChange = useMemo(() => {
    if (!lastChangeDate) return true;
    const nextAllowedChange = add(lastChangeDate, { days: 7 });
    return isBefore(nextAllowedChange, new Date());
  }, [lastChangeDate]);


  useEffect(() => {
    if (user) {
        const userCardOrder = user.preferences?.dashboardCardOrder || [];
        const userChartOrder = user.preferences?.reportChartOrder || [];
        
        if (user.isPremium) {
            setVisibleCardIds(userCardOrder.length > 0 ? userCardOrder : allStats.map(s => s.id));
            setVisibleChartIds(userChartOrder.length > 0 ? userChartOrder : allCharts.map(c => c.id));
        } else {
            const optionalCard = userCardOrder.find(id => !mandatoryCards.includes(id)) || allStats.find(s => !mandatoryCards.includes(s.id))!.id;
            const finalCardOrder = [...mandatoryCards, optionalCard].filter(id => userCardOrder.includes(id) || mandatoryCards.includes(id));
            setVisibleCardIds(userCardOrder.length > 0 ? userCardOrder : [...mandatoryCards, optionalCard]);
            setSelectedOptionalCardId(optionalCard);

            const optionalChart = userChartOrder.find(id => !mandatoryCharts.includes(id)) || allCharts.find(c => !mandatoryCharts.includes(c.id))!.id;
            setVisibleChartIds(userChartOrder.length > 0 ? userChartOrder : [...mandatoryCharts, optionalChart]);
            setSelectedOptionalChartId(optionalChart);
        }
    }
  }, [user]);


  const handleReorder = (type: 'card' | 'chart', index: number, direction: 'up' | 'down') => {
    const list = type === 'card' ? visibleCardIds : visibleChartIds;
    const setter = type === 'card' ? setVisibleCardIds : setVisibleChartIds;

    const newList = [...list];
    const item = newList[index];
    const swapIndex = index + (direction === 'up' ? -1 : 1);
    
    if (swapIndex < 0 || swapIndex >= newList.length) return;
    
    [newList[index], newList[swapIndex]] = [newList[swapIndex], item];
    setter(newList);
  };
  
  const handleSelectItem = (type: 'card' | 'chart', id: string) => {
      const isMandatory = (type === 'card' ? mandatoryCards : mandatoryCharts).includes(id);
      if(isMandatory) return;

      if (user && !user.isPremium && !canChange) {
         toast({ title: "Aguarde para trocar", description: `Você poderá trocar seu item gratuito novamente em 7 dias.`, variant: 'destructive'});
         return;
      }
      
      const optionalSetter = type === 'card' ? setSelectedOptionalCardId : setSelectedOptionalChartId;
      const visibleSetter = type === 'card' ? setVisibleCardIds : setVisibleChartIds;
      const mandatoryItems = type === 'card' ? mandatoryCards : mandatoryCharts;

      optionalSetter(id);
      visibleSetter(prev => [...mandatoryItems, id]);
  }

  const handleSaveLayout = async () => {
    if (!user) return;
    setIsSaving(true);
    
    let preferences = { ...user.preferences };
    let newLastChangeDate = preferences.lastFreebieChangeDate;

    // Check if the optional card/chart has actually changed before updating the date
    const previousOptionalCard = user.preferences.dashboardCardOrder?.find(id => !mandatoryCards.includes(id));
    const previousOptionalChart = user.preferences.reportChartOrder?.find(id => !mandatoryCharts.includes(id));
    
    if(selectedOptionalCardId !== previousOptionalCard || selectedOptionalChartId !== previousOptionalChart) {
        newLastChangeDate = new Date().toISOString();
    }
    
    const result = await updateUser(user.id, {
        preferences: {
            ...preferences,
            dashboardCardOrder: visibleCardIds,
            reportChartOrder: visibleChartIds,
            lastFreebieChangeDate: newLastChangeDate
        }
    });

    if (result.success) {
        await refreshUser();
        toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Layout Salvo!</span></div>,
            description: "Seu novo layout foi salvo e será aplicado."
        });
    } else {
        toast({ 
             title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro!</span></div>,
             description: "Não foi possível salvar seu layout." 
        });
    }
    setIsSaving(false);
  }

  const renderSection = (type: 'card' | 'chart') => {
    const allItems = type === 'card' ? allStats : allCharts;
    const mandatoryItems = type === 'card' ? mandatoryCards : mandatoryCharts;
    const visibleIds = type === 'card' ? visibleCardIds : visibleChartIds;
    const selectedOptionalId = type === 'card' ? selectedOptionalCardId : selectedOptionalChartId;

    const visibleItems = visibleIds.map(id => allItems.find(item => item.id === id)).filter(Boolean);
    const optionalItems = allItems.filter(item => !mandatoryItems.includes(item.id));
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Itens Visíveis</h3>
          <p className="text-sm text-muted-foreground">Arraste para reordenar os itens que aparecem em suas telas.</p>
          <div className="mt-2 space-y-2">
            {visibleItems.map((item, index) => (
              <div key={item!.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                <div className="flex-1">
                   <StatsCard {...item as any} value={0} isPreview={true}/>
                </div>
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReorder(type, index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReorder(type, index, 'down')} disabled={index === visibleItems.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold">Itens Opcionais</h3>
            <p className="text-sm text-muted-foreground">{user?.isPremium ? 'Ative ou desative itens.' : 'Escolha 1 item para exibir.'}</p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {optionalItems.map(item => {
                    const isSelected = selectedOptionalId === item.id;
                    return (
                        <div key={item.id} className="relative">
                            <Card className={isSelected ? 'border-primary' : ''}>
                               <CardContent className="p-2">
                                 <StatsCard {...item as any} value={0} isPreview={true} />
                               </CardContent>
                               <CardFooter className="p-2">
                                 <Button size="sm" className="w-full" onClick={() => handleSelectItem(type, item.id)} disabled={isSelected}>
                                    {isSelected && <Check className="mr-2 h-4 w-4" />}
                                    {isSelected ? 'Selecionado' : 'Selecionar'}
                                 </Button>
                               </CardFooter>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    );
  }

  if (loading || !user) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <Accordion type="multiple" className="w-full space-y-4">
          <Card>
            <AccordionItem value="cards" className="border-b-0">
                <AccordionTrigger className="p-6">
                    <CardTitle className="font-headline text-lg">Organizar Cards do Dashboard</CardTitle>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    {renderSection('card')}
                </AccordionContent>
            </AccordionItem>
          </Card>
           <Card>
            <AccordionItem value="charts" className="border-b-0">
                <AccordionTrigger className="p-6">
                     <CardTitle className="font-headline text-lg">Organizar Gráficos</CardTitle>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    {renderSection('chart')}
                </AccordionContent>
            </AccordionItem>
          </Card>
        </Accordion>
        
        <div className="flex justify-end">
            <Button onClick={handleSaveLayout} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Ordem
            </Button>
        </div>
    </div>
  );
}
