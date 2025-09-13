
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SupportPageClient from './support-page-client';

function SupportPageFallback() {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

export default function SuportePage() {
  return (
    <Suspense fallback={<SupportPageFallback />}>
      <SupportPageClient />
    </Suspense>
  );
}
