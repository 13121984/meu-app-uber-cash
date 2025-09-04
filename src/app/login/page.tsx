
import { AuthForm } from '@/components/auth/auth-form';
import { Car } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/20 p-3 rounded-xl mb-4">
                <Car className="w-10 h-10 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold font-headline text-foreground">Uber Cash</h1>
            <p className="text-muted-foreground">Acesse sua conta para continuar</p>
        </div>
        <AuthForm />
       </div>
    </div>
  );
}
