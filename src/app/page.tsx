
import { HomeClient } from '@/components/inicio/home-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <HomeClient />
    </Suspense>
  );
}
