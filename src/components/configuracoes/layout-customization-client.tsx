

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowUp, ArrowDown, CheckCircle, AlertTriangle, Lock, PlusCircle } from 'lucide-react';
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
import Link from 'next/link';

const StatsCard = dynamic(() => import('../dashboard/stats-card').then(mod => mod.StatsCard), { ssr: false });

export function LayoutCustomizationClient() {
  const { user, loading, refreshUser, isPro, isAutopilot } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [visibleCardIds, setVisibleCardIds] = useState<string[]>([]);
  const [visibleChartIds, setVisibleChartIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
        if (isAutopilot) {
            // Autopilot: Use a ordem salva, ou todos se não houver ordem.
            setVisibleCardIds(user.preferences?.dashboardCardOrder?.length ? user.preferences.dashboardCardOrder : allStats.map(s => s.id));
            setVisibleChartIds(user.preferences?.reportChartOrder?.length ? user.preferences.reportChartOrder : allCharts.map(c => c.id));
        } else if (isPro) {
            // Pro: Usa a ordem salva, mas restrito aos itens obrigatórios.
            const savedCardOrder = user.preferences?.dashboardCardOrder || [];
            const finalCardOrder = [...new Set([...savedCardOrder, ...mandatoryCards])].filter(id => mandatoryCards.includes(id));
            setVisibleCardIds(finalCardOrder);

            const savedChartOrder = user.preferences?.reportChartOrder || [];
            const finalChartOrder = [...new Set([...savedChartOrder, ...mandatoryCharts])].filter(id => mandatoryCharts.includes(id));
            setVisibleChartIds(finalChartOrder);
        } else {
             // Basic: Ordem fixa, sem personalização.
             setVisibleCardIds(mandatoryCards);
             setVisibleChartIds(mandatoryCharts);
        }
    }
  }, [user, isPro, isAutopilot]);


  const handleReorder = (type: 'card' | 'chart', index: number, direction: 'up' | 'down') => {
    if (!isPro) return; // Apenas Pro e Autopilot podem reordenar

    const list = type === 'card' ? visibleCardIds : visibleChartIds;
    const setter = type === 'card' ? setVisibleCardIds : setVisibleChartIds;

    const newList = [...list];
    const item = newList[index];
    const swapIndex = index + (direction === 'up' ? -1 : 1);
    
    if (swapIndex < 0 || swapIndex >= newList.length) return;
    
    [newList[index], newList[swapIndex]] = [newList[swapIndex], item];
    setter(newList);
  };
  
  const handleToggleVisibility = (type: 'card' | 'chart', id: string) => {
    if (!isAutopilot) return; // Apenas Autopilot pode adicionar/remover

    const list = type === 'card' ? visibleCardIds : visibleChartIds;
    const setter = type === 'card' ? setVisibleCardIds : setVisibleChartIds;

    if (list.includes(id)) {
      // Prevent removing mandatory items
      if ((type === 'card' && mandatoryCards.includes(id)) || (type === 'chart' && mandatoryCharts.includes(id))) {
          toast({ title: "Item Obrigatório", description: "Este item não pode ser removido.", variant: "destructive" });
          return;
      }
      setter(list.filter(itemId => itemId !== id));
    } else {
      setter([...list, id]);
    }
  };

  const handleSaveLayout = async () => {
    if (!user || !isPro) return;
    setIsSaving(true);
    
    const result = await updateUser(user.id, {
        preferences: {
            ...user.preferences,
            dashboardCardOrder: visibleCardIds,
            reportChartOrder: visibleChartIds,
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
    const visibleIds = type === 'card' ? visibleCardIds : visibleChartIds;
    
    const mandatoryItems = type === 'card' ? mandatoryCards : mandatoryCharts;

    const visibleItems = visibleIds.map(id => allItems.find(item => item.id === id)).filter(Boolean);
    const optionalItems = allItems.filter(item => !mandatoryItems.includes(item.id));
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Itens Visíveis</h3>
          <p className="text-sm text-muted-foreground">
            {isPro ? "Arraste para reordenar os itens que aparecem em suas telas." : "O plano Básico possui uma ordem fixa. Faça upgrade para personalizar."}
          </p>
          <div className="mt-2 space-y-2">
            {visibleItems.map((item, index) => (
              <div key={item!.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary">
                <div className="flex-1">
                   <StatsCard {...item as any} value={0} isPreview={true}/>
                </div>
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReorder(type, index, 'up')} disabled={index === 0 || !isPro}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReorder(type, index, 'down')} disabled={index === visibleItems.length - 1 || !isPro}><ArrowDown className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {isAutopilot && (
             <div>
                <h3 className="text-lg font-semibold">Adicionar/Remover Itens</h3>
                <p className="text-sm text-muted-foreground">Clique para ativar ou desativar itens do seu painel.</p>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {optionalItems.map(item => {
                        const isSelected = visibleIds.includes(item.id);
                        return (
                             <Card key={item.id} className={isSelected ? 'border-primary' : ''}>
                               <CardContent className="p-2">
                                 <StatsCard {...item as any} value={0} isPreview={true} />
                               </CardContent>
                               <CardFooter className="p-2">
                                 <Button size="sm" className="w-full" onClick={() => handleToggleVisibility(type, item.id)}>
                                    {isSelected ? 'Visível' : 'Oculto'}
                                 </Button>
                               </CardFooter>
                            </Card>
                        )
                    })}
                 </div>
             </div>
        )}
        {!isAutopilot && (
             <Link href="/premium" className="w-full">
                <Card className="mt-4 border-dashed border-primary hover:bg-primary/10 transition-colors">
                    <CardContent className="p-6 text-center">
                        <Lock className="mx-auto h-8 w-8 text-primary mb-2" />
                        <p className="font-semibold text-primary">Desbloqueie todos os cards e gráficos</p>
                        <p className="text-sm text-muted-foreground">Assine o Autopilot para ter controle total da sua visualização.</p>
                    </CardContent>
                </Card>
            </Link>
        )}

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
        <Accordion type="multiple" defaultValue={['cards', 'charts']} className="w-full space-y-4">
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
        
        {isPro && (
            <div className="flex justify-end">
                <Button onClick={handleSaveLayout} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Ordem
                </Button>
            </div>
        )}
    </div>
  );
}
