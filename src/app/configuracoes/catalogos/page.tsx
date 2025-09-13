"use client";

import { CatalogManager } from '@/components/configuracoes/catalog-manager';
import { BookCopy, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCatalogAction } from '@/app/gerenciamento/actions';
import type { Catalog } from '@/services/catalog.service';
import { useState, useEffect } from 'react';

export default function GerenciarCatalogosPage() {
  const [initialCatalog, setInitialCatalog] = useState<Catalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      const data = await getCatalogAction();
      setInitialCatalog(data);
      setIsLoading(false);
    }
    loadCatalog();
  }, []);

  if (isLoading || !initialCatalog) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <BookCopy className="w-8 h-8 text-primary" />
            Gerenciar Catálogos
          </h1>
          <p className="text-muted-foreground">Ative ou desative as categorias que você usa no dia a dia.</p>
        </div>
      </div>
      
      <CatalogManager initialCatalog={initialCatalog} />
    </div>
  );
}
