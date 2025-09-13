import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RelatoriosPageClient from './reports-page-client';

function ReportsPageFallback() {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

export default function RelatoriosPage() {
  return (
    <Suspense fallback={<ReportsPageFallback />}>
      <RelatoriosPageClient />
    </Suspense>
  );
}
