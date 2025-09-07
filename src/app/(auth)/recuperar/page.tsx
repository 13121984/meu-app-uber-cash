
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
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { getUserSecurityQuestions, resetPassword, verifySecurityAnswers } from '@/services/auth.service';

const findUserSchema = z.object({
  userId: z.string().min(1, 'O nome de usuário é obrigatório.'),
});
type FindUserFormData = z.infer<typeof findUserSchema>;

const answerSchema = z.object({
  answer1: z.string().min(1, 'A resposta é obrigatória.'),
  answer2: z.string().min(1, 'A resposta é obrigatória.'),
});
type AnswerFormData = z.infer<typeof answerSchema>;

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
});
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type Step = 'findUser' | 'answerQuestions' | 'resetPassword';

export default function RecuperarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('findUser');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  
  const findUserForm = useForm<FindUserFormData>({ resolver: zodResolver(findUserSchema) });
  const answerForm = useForm<AnswerFormData>({ resolver: zodResolver(answerSchema) });
  const resetPasswordForm = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const handleFindUser = async (data: FindUserFormData) => {
    setIsSubmitting(true);
    const result = await getUserSecurityQuestions(data.userId);
    if (result.success && result.questions) {
      setUserId(data.userId);
      setQuestions(result.questions);
      setStep('answerQuestions');
    } else {
      toast({
        title: ( <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro</span></div>),
        description: result.error || 'Usuário não encontrado.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };
  
  const handleVerifyAnswers = async (data: AnswerFormData) => {
    setIsSubmitting(true);
    const result = await verifySecurityAnswers(userId, [data.answer1, data.answer2]);
     if (result.success) {
      setStep('resetPassword');
    } else {
      toast({
        title: ( <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro</span></div>),
        description: result.error || 'Respostas incorretas.',
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
     setIsSubmitting(true);
     const result = await resetPassword(userId, data.newPassword);
     if (result.success) {
        toast({
            title: ( <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>),
            description: "Sua senha foi redefinida. Você já pode fazer o login.",
        });
        router.push('/login');
     } else {
        toast({
            title: ( <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro</span></div>),
            description: result.error || 'Não foi possível redefinir a senha.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
     }
  }

  const renderStep = () => {
    switch (step) {
      case 'findUser':
        return (
          <form onSubmit={findUserForm.handleSubmit(handleFindUser)}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Recuperar Senha</CardTitle>
              <CardDescription>Digite seu nome de usuário para começar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="userId">Usuário</Label>
              <Input id="userId" {...findUserForm.register('userId')} placeholder="Seu nome de usuário" />
              {findUserForm.formState.errors.userId && <p className="text-sm text-destructive">{findUserForm.formState.errors.userId.message}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Procurar'}
              </Button>
            </CardFooter>
          </form>
        );
      case 'answerQuestions':
        return (
          <form onSubmit={answerForm.handleSubmit(handleVerifyAnswers)}>
             <CardHeader>
              <CardTitle className="font-headline text-2xl">Responda suas Perguntas</CardTitle>
              <CardDescription>Responda para confirmar sua identidade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{questions[0]}</Label>
                <Input {...answerForm.register('answer1')} placeholder="Sua resposta secreta" />
                {answerForm.formState.errors.answer1 && <p className="text-sm text-destructive">{answerForm.formState.errors.answer1.message}</p>}
              </div>
               <div>
                <Label>{questions[1]}</Label>
                <Input {...answerForm.register('answer2')} placeholder="Sua outra resposta secreta" />
                 {answerForm.formState.errors.answer2 && <p className="text-sm text-destructive">{answerForm.formState.errors.answer2.message}</p>}
              </div>
            </CardContent>
             <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verificar Respostas'}
              </Button>
            </CardFooter>
          </form>
        );
      case 'resetPassword':
        return (
            <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Redefinir Senha</CardTitle>
                    <CardDescription>Digite sua nova senha para o usuário <strong>{userId}</strong>.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" {...resetPasswordForm.register('newPassword')} placeholder="Crie uma nova senha segura" />
                    {resetPasswordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{resetPasswordForm.formState.errors.newPassword.message}</p>}
                </CardContent>
                 <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Nova Senha'}
                    </Button>
                </CardFooter>
            </form>
        );
    }
  };

  return (
    <Card>
      {renderStep()}
      <div className="text-center pb-4">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
          Voltar para o Login
        </Link>
      </div>
    </Card>
  );
}
