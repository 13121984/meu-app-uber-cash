
"use client";

import { Dispatch, useState } from 'react';
import { PlusCircle, Trash2, Car, DollarSign, CircleDollarSign, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Earning, State } from './registration-wizard';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import type { CatalogItem } from '@/services/catalog.service';


type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };

interface Step2EarningsProps {
  data: State;
  dispatch: Dispatch<Action>;
  categories: CatalogItem[];
}

export function Step2Earnings({ data, dispatch, categories }: Step2EarningsProps) {
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
      data.earnings.length > 0 ? data.earnings.map(e => e.category) : []
  );

  const handleCategoryToggle = (categoryName: string, isDefault: boolean) => {
    if (!isPremium && !isDefault) {
        // Here you could trigger a modal or a toast to upsell
        return;
    }

    const newSelected = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    
    setSelectedCategories(newSelected);

    // Sync the main state
    const newEarnings = newSelected.map(cat => {
        const existing = data.earnings.find(e => e.category === cat);
        return existing || { id: Date.now() + Math.random(), category: cat, trips: 0, amount: 0 };
    });
    dispatch({ type: 'UPDATE_FIELD', payload: { field: 'earnings', value: newEarnings } });
  }

  const handleEarningChange = (category: string, field: 'trips' | 'amount', value: string) => {
    const updatedEarnings = data.earnings.map((e) => {
      if (e.category === category) {
        const numValue = parseFloat(value.replace(',', '.')) || 0;
        return { ...e, [field]: numValue };
      }
      return e;
    });
    dispatch({ type: 'UPDATE_FIELD', payload: { field: 'earnings', value: updatedEarnings } });
  };
  

  return (
    <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-primary"/>
                Ganhos do Período
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
            <div>
                <Label>Categorias de Trabalho</Label>
                <p className="text-xs text-muted-foreground mb-2">Selecione todas as plataformas em que trabalhou.</p>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => {
                        const isSelectable = isPremium || cat.isDefault;
                        const isSelected = selectedCategories.includes(cat.name);
                        return (
                         <div key={cat.name} onClick={() => handleCategoryToggle(cat.name, cat.isDefault)}
                           className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                             isSelectable ? "cursor-pointer" : "cursor-not-allowed bg-secondary/50",
                             isSelected ? "border-primary bg-primary/10" : "border-transparent bg-secondary"
                           )}
                         >
                            <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleCategoryToggle(cat.name, cat.isDefault)}
                                id={`check-${cat.name}`}
                                disabled={!isSelectable}
                            />
                            <Label htmlFor={`check-${cat.name}`} className={cn("flex-1", isSelectable ? "cursor-pointer" : "cursor-not-allowed")}>{cat.name}</Label>
                            {!isSelectable && <Lock className="h-4 w-4 text-amber-500" />}
                         </div>
                    )})}
                </div>
            </div>

            {selectedCategories.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h3 className="font-semibold">Preencha os valores para cada categoria:</h3>
                    {selectedCategories.map(cat => {
                        const earning = data.earnings.find(e => e.category === cat);
                        return (
                            <Card key={cat} className="bg-secondary/50 p-4">
                                <p className="font-bold mb-2">{cat}</p>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`trips-${cat}`}>Viagens</Label>
                                        <div className="relative">
                                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
                                            <Input
                                            id={`trips-${cat}`} type="number" placeholder="Ex: 10"
                                            value={earning?.trips || ''}
                                            onChange={(e) => handleEarningChange(cat, 'trips', e.target.value)}
                                            className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor={`amount-${cat}`}>Valor (R$)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                            <Input
                                            id={`amount-${cat}`} type="number" step="0.01" placeholder="Ex: 150,50"
                                            value={earning?.amount || ''}
                                            onChange={(e) => handleEarningChange(cat, 'amount', e.target.value)}
                                            className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </CardContent>
    </Card>
  );
}

    