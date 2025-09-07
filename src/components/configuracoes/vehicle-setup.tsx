
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "../ui/input";
import { toast } from "@/hooks/use-toast";
import { addVehicle } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const vehicleSchema = z.object({
  brand: z.string().min(2, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  color: z.string().min(3, "Cor é obrigatória."),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export function VehicleSetup() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { brand: '', model: '', color: '' },
    });

    const onSubmit = async (data: VehicleFormData) => {
        if (!user) return;
        setIsSubmitting(true);
        const result = await addVehicle(user.id, data);
        if (result.success) {
            toast({ title: "Veículo Salvo!", description: "Vamos começar a acompanhar sua performance." });
            await refreshUser(); // Atualiza o contexto com o novo veículo
            router.push('/'); // Redireciona para a página inicial
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-secondary">
             <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Car className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="font-headline text-2xl mt-4">Cadastre seu Veículo</CardTitle>
                    <CardDescription>
                        Este é o último passo! Precisamos dos dados do seu carro para começar a calcular sua performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="brand" render={({ field }) => (
                                <FormItem><FormLabel>Marca</FormLabel><FormControl><Input placeholder="Ex: Fiat" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input placeholder="Ex: Mobi" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel>Cor</FormLabel><FormControl><Input placeholder="Ex: Branco" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" disabled={isSubmitting} className="w-full !mt-6">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar e Começar
                            </Button>
                        </form>
                    </Form>
                </CardContent>
             </Card>
        </div>
    );
}
