
"use client";

import { Dispatch, useState, useEffect } from 'react';
import { PlusCircle, Trash2, Car, DollarSign, CircleDollarSign, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { user, isPro } = useAuth();

  const getInitialSelectedCategories = () => {
    // If editing an existing entry, use its categories
    if (data.earnings.length > 0) {
      return data.earnings.map(e => e.category);
    }
    // For new entries, select the default "Aplicativo"
    const defaultCategory = categories.find(c => c.isDefault && c.name === "Aplicativo");
    return defaultCategory ? [defaultCategory.name] : [];
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>(getInitialSelectedCategories);
  
  // Effect to sync the main state when the component initializes or selection changes
  useEffect(() => {
    const newEarnings = selectedCategories.map(catName => {
        const existing = data.earnings.find(e => e.category === catName);
        return existing || { id: Date.now() + Math.random(), category: catName, trips: 0, amount: 0 };
    });
    dispatch({ type: 'UPDATE_FIELD', payload: { field: 'earnings', value: newEarnings } });
  }, [selectedCategories, dispatch]);


  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    
    setSelectedCategories(newSelected);
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
                        const isSelected = selectedCategories.includes(cat.name);
                        return (
                         <div key={cat.name} onClick={() => handleCategoryToggle(cat.name)}
                           className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer",
                             isSelected ? "border-primary bg-primary/10" : "border-transparent bg-secondary"
                           )}
                         >
                            <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => handleCategoryToggle(cat.name)}
                                id={`check-${cat.name}`}
                            />
                            <Label htmlFor={`check-${cat.name}`} className="flex-1 cursor-pointer">{cat.name}</Label>
                         </div>
                    )})}
                </div>
                 {!isPro && 
                    <p className="text-xs text-muted-foreground mt-2">
                        Para adicionar ou editar categorias, <Link href="/premium" className="underline text-primary">faça um upgrade para o Pro</Link>.
                    </p>
                }
            </div>

            {selectedCategories.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h3 className="font-semibold">Preencha os valores para cada categoria selecionada:</h3>
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
