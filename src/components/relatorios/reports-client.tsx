

"use client";

import { useMemo, useState, useTransition } from 'react';
import { GripVertical, Lock, Info, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { updateUser } from '@/services/auth.service';
import { differenceInDays, parseISO, isBefore, addDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { allStats, mandatoryCards } from '@/lib/dashboard-items';
import { Loader2 } from 'lucide-react';


const DraggableCard = ({ id, title, children, onMove, isFirst, isLast }: { id: string; title: string; children: React.ReactNode; onMove: (direction: 'up' | 'down') => void; isFirst: boolean; isLast: boolean; }) => {
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
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
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

  const [cardOrder, setCardOrder] = useState<string[]>(
    user?.preferences?.dashboardCardOrder || [...mandatoryCards, allStats.find(s => !mandatoryCards.includes(s.id))!.id]
  );
  
  const handleMoveCard = (cardId: string, direction: 'up' | 'down') => {
      const index = cardOrder.indexOf(cardId);
      if (index === -1) return;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Prevent mandatory cards from being moved out of their block
      const isMandatory = mandatoryCards.includes(cardId);
      if (isMandatory && (newIndex < 0 || newIndex >= mandatoryCards.length)) {
          return;
      }
      if(!isMandatory && (newIndex < mandatoryCards.length || newIndex >= cardOrder.length)) {
          return;
      }
      
      const newOrder = [...cardOrder];
      // Simple swap
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      setCardOrder(newOrder);
  };
  
  const handleSaveLayout = async () => {
    startSavingTransition(async () => {
      if(user) {
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
    if (user?.isPremium) {
        // Premium user toggles visibility
        if (cardOrder.includes(cardId)) {
            setCardOrder(cardOrder.filter(id => id !== cardId));
        } else {
            setCardOrder([...cardOrder, cardId]);
        }
    } else {
        // Free user swaps the optional card
        const newOrder = [...mandatoryCards, cardId];
        setCardOrder(newOrder);
    }
  }


  if (!user) return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const optionalCards = allStats.filter(stat => !mandatoryCards.includes(stat.id));
  const visibleOptionalCards = cardOrder.filter(id => !mandatoryCards.includes(id));
  const visibleMandatoryCards = cardOrder.filter(id => mandatoryCards.includes(id));

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

                <h3 className="font-semibold mb-4">Cards Visíveis</h3>
                <div className="space-y-4">
                    {visibleMandatoryCards.map((id, index) => {
                        const cardInfo = allStats.find(c => c.id === id);
                        return cardInfo ? (
                            <DraggableCard 
                                key={id} 
                                id={id}
                                title={cardInfo.title}
                                onMove={(dir) => handleMoveCard(id, dir)}
                                isFirst={index === 0}
                                isLast={index === visibleMandatoryCards.length - 1}
                            >
                                <StatsCard {...cardInfo} />
                            </DraggableCard>
                        ) : null
                    })}
                     {visibleOptionalCards.map((id, index) => {
                        const cardInfo = allStats.find(c => c.id === id);
                        return cardInfo ? (
                             <DraggableCard 
                                key={id} 
                                id={id}
                                title={cardInfo.title}
                                onMove={(dir) => handleMoveCard(id, dir)}
                                isFirst={index === 0}
                                isLast={index === visibleOptionalCards.length - 1}
                            >
                                <StatsCard {...cardInfo} />
                            </DraggableCard>
                        ) : null
                    })}
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold mb-2">Cards Opcionais</h3>
                     <p className="text-sm text-muted-foreground mb-4">
                       {user.isPremium ? "Clique para adicionar ou remover do seu dashboard." : "Clique para substituir o seu card opcional."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {optionalCards.map(card => {
                            const isVisible = cardOrder.includes(card.id);
                            return (
                                <Card 
                                    key={card.id} 
                                    className={`relative p-2 border-2 cursor-pointer ${isVisible ? 'border-primary' : 'border-dashed hover:border-primary/50'}`}
                                    onClick={() => handleSelectOptionalCard(card.id)}
                                >
                                    {isVisible && user.isPremium && <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1"><Check className="h-3 w-3"/></div>}
                                    <StatsCard {...card} value={0} />
                                </Card>
                            )
                        })}
                    </div>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
