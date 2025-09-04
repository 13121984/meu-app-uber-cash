
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Loader2, Mail } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, "A senha é obrigatória."),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

const resetSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido para a recuperação." }),
});


type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

export function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { login, signup, sendPasswordReset } = useAuth();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });


  const handleLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // O redirecionamento será tratado pelo AuthProvider
    } catch (error: any) {
      toast({
        title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro no Login</span></div>,
        description: "Credenciais inválidas. Verifique seu e-mail e senha.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      await signup(data.email, data.password);
       toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Conta Criada!</span></div>,
        description: "Você já pode fazer o login.",
      });
    } catch (error: any) {
       toast({
        title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro no Cadastro</span></div>,
        description: "Este e-mail já pode estar em uso ou a senha é inválida.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    try {
        await sendPasswordReset(resetEmail);
        toast({
            title: <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/><span>Verifique seu E-mail</span></div>,
            description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        });
    } catch (error) {
        // Não informamos o erro específico para não revelar se um e-mail existe no sistema
        toast({
            title: <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/><span>Verifique seu E-mail</span></div>,
            description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        });
    } finally {
        setIsResetting(false);
        // Fecha o dialog
        document.getElementById('reset-cancel-button')?.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="p-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Senha</FormLabel>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="link" type="button" className="text-xs p-0 h-auto">Esqueceu a senha?</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Redefinir Senha</AlertDialogTitle>
                              <AlertDialogDescription>
                                Digite seu e-mail para enviarmos um link de recuperação.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                               <div className="space-y-2">
                                <Label htmlFor="reset-email">E-mail de Recuperação</Label>
                                <Input 
                                    id="reset-email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                               </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel id="reset-cancel-button">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handlePasswordReset} disabled={isResetting}>
                                 {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Entrar
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signup" className="p-6">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl><Input type="password" placeholder="Pelo menos 6 caracteres" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Criar Conta
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
