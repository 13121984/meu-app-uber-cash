import { CatalogManager } from '@/components/configuracoes/catalog-manager';
import { BookCopy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getCatalog } from '@/services/catalog.service';

export default async function GerenciarCatalogosPage() {
  const initialCatalog = await getCatalog();
  
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
