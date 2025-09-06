"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Loader2, CheckCircle, AlertTriangle, UploadCloud, ArrowUp, ArrowDown } from 'lucide-react';
import { saveCatalog, type Catalog, type CatalogItem } from '@/services/catalog.service';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CatalogManagerProps {
    initialCatalog: Catalog;
}

export function CatalogManager({ initialCatalog }: CatalogManagerProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  
  const [earningsCategories, setEarningsCategories] = useState<CatalogItem[]>(initialCatalog.earnings);
  const [fuelCategories, setFuelCategories] = useState<CatalogItem[]>(initialCatalog.fuel);
  const [textToImport, setTextToImport] = useState('');
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
        
        // Check bounds and ensure we don't swap between default and custom groups
        if (swapIndex < 0 || swapIndex >= list.length || list[swapIndex].isDefault !== item.isDefault) {
            return list;
        }

        // Simple swap
        [list[index], list[swapIndex]] = [list[swapIndex], list[index]]; 
        return list;
    });
  }

  const handleImport = () => {
    if(!textToImport.trim()) return;
    const newItems = textToImport.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const updater = importTarget === 'earnings' ? setEarningsCategories : setFuelCategories;
    
    updater(prev => {
        const existingNames = new Set(prev.map(i => i.name));
        const itemsToAdd = newItems
            .filter(name => !existingNames.has(name))
            .map(name => ({ name, active: true, isDefault: false }));
        return [...prev, ...itemsToAdd];
    });

    setTextToImport('');
    toast({
        title: "Categorias Importadas",
        description: `${newItems.length} novas categorias foram adicionadas e ativadas. Salve as alterações para confirmar.`
    })
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

  const CategorySection = ({ title, categories, type, onToggle, onDelete, onReorder }: {
    title: string;
    categories: CatalogItem[];
    type: 'earnings' | 'fuel';
    onToggle: (name: string) => void;
    onDelete: (name: string) => void;
    onReorder: (index: number, direction: 'up' | 'down') => void;
  }) => {
    const defaultItems = categories.filter(c => c.isDefault);
    const customItems = categories.filter(c => !c.isDefault);

    // This function now receives the index within its own group (default or custom)
    const renderCategoryItem = (cat: CatalogItem, index: number, group: CatalogItem[]) => {
        const originalIndex = categories.findIndex(c => c.name === cat.name);
        
        return (
             <div key={cat.name} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReorder(originalIndex, 'up')} disabled={index === 0}>
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReorder(originalIndex, 'down')} disabled={index === group.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <Label htmlFor={`switch-${cat.name}`} className="flex-1 cursor-pointer">{cat.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                    {!cat.isDefault && (
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(cat.name)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    )}
                    <Switch
                        id={`switch-${cat.name}`}
                        checked={cat.active}
                        onCheckedChange={() => onToggle(cat.name)}
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
            <ScrollArea className="h-80">
                <div className="space-y-4 pr-6">
                  {defaultItems.map((cat, index) => renderCategoryItem(cat, index, defaultItems))}
                  {customItems.length > 0 && defaultItems.length > 0 && <hr className="my-4 border-dashed" />}
                  {customItems.map((cat, index) => renderCategoryItem(cat, index, customItems))}
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
                    Importar Novas Categorias
                </CardTitle>
                <CardDescription>
                    Cole uma lista de categorias (uma por linha) para adicioná-las rapidamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Uber Comfort&#x0a;Uber Black&#x0a;Indriver"
                    value={textToImport}
                    onChange={(e) => setTextToImport(e.target.value)}
                    className="h-28"
                />
                 <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1">
                         <Label>Importar para:</Label>
                         <div className="flex gap-4 pt-2">
                            <Button variant={importTarget === 'earnings' ? 'default' : 'outline'} onClick={() => setImportTarget('earnings')}>Ganhos</Button>
                            <Button variant={importTarget === 'fuel' ? 'default' : 'outline'} onClick={() => setImportTarget('fuel')}>Combustível</Button>
                        </div>
                     </div>
                     <Button onClick={handleImport} className="w-full sm:w-auto self-end">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Adicionar à Lista
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-6">
            <CategorySection
                title="Categorias de Ganhos"
                type="earnings"
                categories={earningsCategories}
                onToggle={(name) => handleToggle('earnings', name)}
                onDelete={(name) => handleDelete('earnings', name)}
                onReorder={(index, direction) => handleReorder('earnings', index, direction)}
            />
            <CategorySection
                title="Tipos de Combustível"
                type="fuel"
                categories={fuelCategories}
                onToggle={(name) => handleToggle('fuel', name)}
                onDelete={(name) => handleDelete('fuel', name)}
                onReorder={(index, direction) => handleReorder('fuel', index, direction)}
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
