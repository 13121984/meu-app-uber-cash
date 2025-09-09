
"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, CheckCircle, AlertTriangle, UploadCloud, ArrowUp, ArrowDown, Lock } from 'lucide-react';
import { saveCatalog, type Catalog, type CatalogItem } from '@/services/catalog.service';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Input } from '../ui/input';

interface CatalogManagerProps {
    initialCatalog: Catalog;
}

export function CatalogManager({ initialCatalog }: CatalogManagerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;

  const [isSaving, startSavingTransition] = useTransition();
  
  const [earningsCategories, setEarningsCategories] = useState<CatalogItem[]>(initialCatalog.earnings);
  const [fuelCategories, setFuelCategories] = useState<CatalogItem[]>(initialCatalog.fuel);
  
  const [newItemName, setNewItemName] = useState('');
  const [importTarget, setImportTarget] = useState<'earnings' | 'fuel'>('earnings');

  const handleToggle = (type: 'earnings' | 'fuel', name: string) => {
    const updater = type === 'earnings' ? setEarningsCategories : setFuelCategories;
    updater(prev => prev.map(item => 
        item.name === name ? { ...item, active: !item.active } : item
    ));
  };
  
  const handleDelete = (type: 'earnings' | 'fuel', name: string) => {
    const updater = type === 'earnings' ? setEarningsCategories : setFuelCategories;
    updater(prev => prev.filter(item => item.name !== name));
  };
  
  const handleReorder = (type: 'earnings' | 'fuel', index: number, direction: 'up' | 'down') => {
    const updater = type === 'earnings' ? setEarningsCategories : setFuelCategories;
    updater(prev => {
        const list = [...prev];
        const item = list[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (swapIndex < 0 || swapIndex >= list.length) {
            return list;
        }

        [list[index], list[swapIndex]] = [list[swapIndex], item]; 
        return list;
    });
  }

  const handleAddItem = () => {
    if(!newItemName.trim()) return;

    const updater = importTarget === 'earnings' ? setEarningsCategories : setFuelCategories;
    
    updater(prev => {
        const existingNames = new Set(prev.map(i => i.name.toLowerCase()));
        if(existingNames.has(newItemName.toLowerCase())) {
            toast({ title: "Categoria já existe", description: "Esta categoria já está na lista.", variant: "destructive" });
            return prev;
        }
        const newItem = { name: newItemName, active: true, isDefault: false };
        return [...prev, newItem];
    });

    setNewItemName('');
  }

  const handleSaveChanges = async () => {
    startSavingTransition(async () => {
        try {
          await saveCatalog({
            earnings: earningsCategories,
            fuel: fuelCategories
          });
          toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Catálogos Salvos!</span></div>,
            description: "Suas categorias foram atualizadas com sucesso.",
          });
          router.refresh(); 
        } catch (error) {
          toast({
            title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro ao Salvar</span></div>,
            description: "Não foi possível salvar os catálogos.",
            variant: "destructive",
          });
        }
    });
  };

  const CategorySection = ({ title, categories, type }: {
    title: string;
    categories: CatalogItem[];
    type: 'earnings' | 'fuel';
  }) => {
    
    const renderCategoryItem = (cat: CatalogItem, index: number) => {
        const canEdit = isPremium || cat.isDefault;
        const canDelete = isPremium && !cat.isDefault;
        const canReorder = isPremium;

        return (
             <div key={cat.name} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                <div className="flex items-center gap-2 flex-1">
                     {canReorder && (
                        <div className="flex flex-col">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(type, index, 'up')} disabled={index === 0}>
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(type, index, 'down')} disabled={index === categories.length - 1}>
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                     )}
                    <Label htmlFor={`switch-${cat.name}`} className="flex-1 cursor-pointer">{cat.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(type, cat.name)} disabled={!canDelete}>
                     {canDelete ? <Trash2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                   </Button>
                    <Switch
                        id={`switch-${cat.name}`}
                        checked={cat.active}
                        onCheckedChange={() => handleToggle(type, cat.name)}
                    />
                </div>
              </div>
        )
    };
    
    return (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="font-headline">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[26rem]">
                <div className="space-y-4 pr-6">
                  {categories.map((cat, index) => renderCategoryItem(cat, index))}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    Adicionar Nova Categoria
                </CardTitle>
                 <CardDescription>
                    {isPremium
                        ? "Adicione categorias personalizadas para ganhos ou combustíveis."
                        : "Assine o plano Premium para criar suas próprias categorias."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="new-item-name">Nome da Nova Categoria</Label>
                        <Input 
                            id="new-item-name"
                            placeholder="Ex: Uber Comfort"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            disabled={!isPremium}
                        />
                    </div>
                     <div className="space-y-2">
                         <Label>Adicionar em:</Label>
                         <div className="flex gap-4">
                            <Button variant={importTarget === 'earnings' ? 'default' : 'outline'} onClick={() => setImportTarget('earnings')} disabled={!isPremium}>Ganhos</Button>
                            <Button variant={importTarget === 'fuel' ? 'default' : 'outline'} onClick={() => setImportTarget('fuel')} disabled={!isPremium}>Combustível</Button>
                        </div>
                     </div>
                     <Button onClick={handleAddItem} className="w-full sm:w-auto self-end" disabled={!isPremium || !newItemName}>
                        {isPremium ? <PlusCircle className="mr-2 h-4 w-4"/> : <Lock className="mr-2 h-4 w-4"/>}
                        Adicionar
                    </Button>
                </div>
                 {!isPremium && (
                    <Link href="/premium">
                        <Button variant="link" className="p-0 h-auto">Desbloquear com Premium</Button>
                    </Link>
                )}
            </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-6">
            <CategorySection
                title="Categorias de Ganhos"
                type="earnings"
                categories={earningsCategories}
            />
            <CategorySection
                title="Tipos de Combustível"
                type="fuel"
                categories={fuelCategories}
            />
        </div>

        <div className="flex justify-end pt-4">
             <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Todas as Alterações
            </Button>
        </div>
    </div>
  );
}
