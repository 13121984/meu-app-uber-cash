import { CatalogManager } from '@/components/configuracoes/catalog-manager';
import { BookCopy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GerenciarCatalogosPage() {
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
          <p className="text-muted-foreground">Adicione ou remova categorias de ganhos e tipos de combustível.</p>
        </div>
      </div>
      
      <CatalogManager />
    </div>
  );
}
