
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Mail, Lock } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/context/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { sendPasswordReset } from '@/services/auth.service';


const authSchema = z.object({
    email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export type AuthFormData = z.infer<typeof authSchema>;

type AuthMode = "login" | "signup";

export function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const { login, signup } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const getFirebaseErrorMessage = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/invalid-email': return "O formato do e-mail é inválido.";
      case 'auth/user-disabled': return "Este usuário foi desabilitado.";
      case 'auth/user-not-found': return "Nenhuma conta encontrada com este e-mail.";
      case 'auth/wrong-password': return "Senha incorreta. Tente novamente.";
      case 'auth/email-already-in-use': return "Este e-mail já está em uso por outra conta.";
      case 'auth/weak-password': return "A senha é muito fraca.";
      case 'auth/invalid-credential': return "Credenciais inválidas. Verifique seu e-mail e senha.";
      default: return `Ocorreu um erro inesperado: ${error.message}`;
    }
  }

  const handleAuth = async (data: AuthFormData, mode: AuthMode) => {
    setIsSubmitting(true);
    try {
        if (mode === 'login') {
            await login(data);
        } else {
            await signup(data);
        }
        // O redirecionamento é tratado pelo AuthProvider/ProtectedRoute
    } catch (error) {
        let description = "Não foi possível completar a ação. Tente novamente.";
        if (error instanceof FirebaseError) {
          description = getFirebaseErrorMessage(error);
        }
        toast({
            title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro de Autenticação</span></div>,
            description: description,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handlePasswordReset = async () => {
    if(!resetEmail) {
        toast({ title: "Erro", description: "Por favor, digite seu e-mail.", variant: "destructive" });
        return;
    }
    setIsResetting(true);
    try {
        await sendPasswordReset(resetEmail);
        toast({
            title: "Verifique seu E-mail",
            description: "Se uma conta existir, um link para redefinir a senha será enviado.",
        });
    } catch (error) {
        // Não mostrar erro detalhado por segurança
         toast({
            title: "Verifique seu E-mail",
            description: "Se uma conta existir, um link para redefinir a senha será enviado.",
        });
    } finally {
        setIsResetting(false);
    }
  }

  const renderFormContent = (mode: AuthMode) => (
     <form onSubmit={handleSubmit(data => handleAuth(data, mode))} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>E-mail</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id={`${mode}-email`} type="email" placeholder="seu-email@exemplo.com" {...register('email')} className="pl-10" />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>Senha</Label>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id={`${mode}-password`} type="password" placeholder="••••••••" {...register('password')} className="pl-10"/>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </Button>
    </form>
  )

  return (
    <>
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="p-1">
                {renderFormContent('login')}
            </TabsContent>
            <TabsContent value="signup" className="p-1">
                 {renderFormContent('signup')}
            </TabsContent>
        </Tabs>
        <div className="text-center mt-4">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="link" className="text-sm text-muted-foreground">Esqueceu a senha?</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Redefinir Senha</AlertDialogTitle>
                    <AlertDialogDescription>
                        Digite seu e-mail abaixo. Se houver uma conta associada, enviaremos um link para você criar uma nova senha.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                       <div className="space-y-2">
                        <Label htmlFor="reset-email">E-mail de Recuperação</Label>
                        <Input 
                            id="reset-email"
                            type="email"
                            placeholder="seu-email@exemplo.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                        />
                       </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordReset} disabled={isResetting}>
                         {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Link
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </>
  );
}
