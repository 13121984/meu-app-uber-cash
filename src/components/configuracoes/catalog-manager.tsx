"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { BookCopy, PlusCircle, Trash2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { saveCatalog, getCatalog } from '@/services/catalog.service';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function CatalogManager() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [earningsCategories, setEarningsCategories] = useState<string[]>([]);
  const [fuelCategories, setFuelCategories] = useState<string[]>([]);
  const [newEarningCat, setNewEarningCat] = useState('');
  const [newFuelCat, setNewFuelCat] = useState('');

  useEffect(() => {
    async function loadCatalog() {
        setIsLoading(true);
        try {
            const initialData = await getCatalog();
            setEarningsCategories(initialData.earnings);
            setFuelCategories(initialData.fuel);
        } catch (error) {
            toast({
                title: "Erro ao carregar catálogos",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }
    loadCatalog();
  }, []);

  const handleAddCategory = (type: 'earnings' | 'fuel') => {
    if (type === 'earnings') {
      if (newEarningCat && !earningsCategories.includes(newEarningCat)) {
        setEarningsCategories([...earningsCategories, newEarningCat]);
        setNewEarningCat('');
      }
    } else {
      if (newFuelCat && !fuelCategories.includes(newFuelCat)) {
        setFuelCategories([...fuelCategories, newFuelCat]);
        setNewFuelCat('');
      }
    }
  };

  const handleRemoveCategory = (type: 'earnings' | 'fuel', category: string) => {
    if (type === 'earnings') {
      setEarningsCategories(earningsCategories.filter(c => c !== category));
    } else {
      setFuelCategories(fuelCategories.filter(c => c !== category));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const CategorySection = ({ title, categories, newCat, setNewCat, onAdd, onRemove }: {
    title: string;
    categories: string[];
    newCat: string;
    setNewCat: (val: string) => void;
    onAdd: () => void;
    onRemove: (cat: string) => void;
  }) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">{title}</h4>
      <div className="flex gap-2">
        <Input 
          placeholder="Nova categoria..."
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat} className="flex items-center justify-between p-2 rounded-md bg-secondary">
            <span className="text-sm">{cat}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(cat)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
  
  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BookCopy className="h-6 w-6 text-primary" />
          Gerenciar Catálogos
        </CardTitle>
        <CardDescription>
          Adicione ou remova categorias de ganhos e tipos de combustível para personalizar os formulários de registro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategorySection
                title="Categorias de Ganhos"
                categories={earningsCategories}
                newCat={newEarningCat}
                setNewCat={setNewEarningCat}
                onAdd={() => handleAddCategory('earnings')}
                onRemove={(cat) => handleRemoveCategory('earnings', cat)}
            />
            <CategorySection
                title="Tipos de Combustível"
                categories={fuelCategories}
                newCat={newFuelCat}
                setNewCat={setNewFuelCat}
                onAdd={() => handleAddCategory('fuel')}
                onRemove={(cat) => handleRemoveCategory('fuel', cat)}
            />
        </div>
        <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Alterações nos Catálogos
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
