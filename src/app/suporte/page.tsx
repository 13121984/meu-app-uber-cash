
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BotMessageSquare, Send, Mail, LifeBuoy } from "lucide-react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SupportForm() {
    const searchParams = useSearchParams();
    const assuntoInicial = searchParams.get('assunto') || '';

    const [assunto, setAssunto] = useState(assuntoInicial === 'afiliado' ? 'Interesse no Programa de Afiliados' : '');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoLink = `mailto:ubercashtxia@gmail.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
        window.location.href = mailtoLink;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="assunto">Assunto</Label>
                <Input 
                    id="assunto" 
                    placeholder="Ex: Dúvida sobre relatórios" 
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="mensagem">Sua Mensagem</Label>
                <Textarea 
                    id="mensagem" 
                    placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível." 
                    rows={6}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
            </Button>
        </form>
    );
}

export default function SuportePage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <LifeBuoy className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-4xl font-bold font-headline">Suporte ao Cliente</h1>
                <p className="mt-2 text-lg text-muted-foreground">Estamos aqui para ajudar você.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chat IA Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BotMessageSquare className="h-6 w-6 text-primary" />
                            Assistente Virtual (Em Breve)
                        </CardTitle>
                        <CardDescription>
                            Tire dúvidas rápidas sobre as funcionalidades do aplicativo com nossa inteligência artificial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center p-10 bg-secondary rounded-b-xl">
                        <p className="text-muted-foreground">Nossa equipe de engenharia está trabalhando para trazer um assistente virtual que responderá suas perguntas em tempo real. Fique de olho nas próximas atualizações!</p>
                    </CardContent>
                </Card>

                {/* Ticket/Email Card */}
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            Abrir um Ticket por E-mail
                        </CardTitle>
                        <CardDescription>
                            Se não encontrou sua resposta na <Link href="/ajuda" className="underline text-primary">Central de Ajuda</Link>, envie-nos uma mensagem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SupportForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
