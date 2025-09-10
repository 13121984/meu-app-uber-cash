
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { AlertTriangle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  userId: z.string().min(1, 'O nome de usuário é obrigatório.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const result = await login(data.userId, data.password);
    
    if (result.success && result.user) {
      router.push('/');
    } else {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Falha no Login</span>
          </div>
        ),
        description: result.error,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Acessar sua Conta</CardTitle>
          <CardDescription>Bem-vindo de volta! Insira seus dados para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Usuário</Label>
            <Input id="userId" {...register('userId')} placeholder="Seu nome de usuário" />
            {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Sua senha" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
           <div className="text-right">
              <Link href="/recuperar" className="text-sm text-muted-foreground hover:text-primary">
                  Esqueceu a senha?
              </Link>
           </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-semibold text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
