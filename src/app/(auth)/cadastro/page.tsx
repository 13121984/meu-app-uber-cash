
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
import { Separator } from '@/components/ui/separator';

const signupSchema = z.object({
  userId: z.string().min(3, 'O usuário deve ter pelo menos 3 caracteres.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  securityQuestion1: z.string().min(1, 'A pergunta de segurança é obrigatória.'),
  securityAnswer1: z.string().min(1, 'A resposta de segurança é obrigatória.'),
  securityQuestion2: z.string().min(1, 'A pergunta de segurança é obrigatória.'),
  securityAnswer2: z.string().min(1, 'A resposta de segurança é obrigatória.'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    const { userId, password, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 } = data;
    
    const securityAnswers = [
      { question: securityQuestion1, answer: securityAnswer1 },
      { question: securityQuestion2, answer: securityAnswer2 },
    ];
    
    const result = await signup(userId, password, securityAnswers);
    
    if (result.success) {
      toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você será redirecionado para a tela de login.",
          variant: "success",
      });
      router.push('/login');
    } else {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Falha no Cadastro</span>
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
          <CardTitle className="font-headline text-2xl">Crie sua Conta</CardTitle>
          <CardDescription>É rápido e fácil. Comece a organizar suas finanças agora mesmo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Usuário</Label>
            <Input id="userId" {...register('userId')} placeholder="Escolha um nome de usuário" />
            {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Crie uma senha segura" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Separator className="my-6" />

           <div className="space-y-1">
             <h3 className="font-semibold">Perguntas de Segurança</h3>
             <p className="text-sm text-muted-foreground">Isso ajudará a recuperar sua conta se você esquecer a senha.</p>
           </div>
          
           <div className="space-y-2">
            <Label htmlFor="securityQuestion1">Pergunta 1</Label>
            <Input id="securityQuestion1" {...register('securityQuestion1')} placeholder="Ex: Nome do seu primeiro animal?" />
            {errors.securityQuestion1 && <p className="text-sm text-destructive">{errors.securityQuestion1.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityAnswer1">Resposta 1</Label>
            <Input id="securityAnswer1" type="text" {...register('securityAnswer1')} placeholder="Sua resposta secreta" />
            {errors.securityAnswer1 && <p className="text-sm text-destructive">{errors.securityAnswer1.message}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="securityQuestion2">Pergunta 2</Label>
            <Input id="securityQuestion2" {...register('securityQuestion2')} placeholder="Ex: Cidade onde seus pais se conheceram?" />
            {errors.securityQuestion2 && <p className="text-sm text-destructive">{errors.securityQuestion2.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityAnswer2">Resposta 2</Label>
            <Input id="securityAnswer2" type="text" {...register('securityAnswer2')} placeholder="Sua outra resposta secreta" />
            {errors.securityAnswer2 && <p className="text-sm text-destructive">{errors.securityAnswer2.message}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
