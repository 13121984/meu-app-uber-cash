
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, PlusCircle, Trash2, Loader2, Lock, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "../ui/input";
import { toast } from "@/hooks/use-toast";
import { addVehicle, deleteVehicle, Vehicle } from "@/services/auth.service";
import Link from "next/link";


const vehicleSchema = z.object({
  brand: z.string().min(2, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  color: z.string().min(3, "Cor é obrigatória."),
  plate: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

function VehicleForm({ onSuccess }: { onSuccess: () => void }) {
    const { user, refreshUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: { brand: '', model: '', color: '', plate: '' },
    });

    const onSubmit = async (data: VehicleFormData) => {
        if (!user) return;
        setIsSubmitting(true);
        const result = await addVehicle(user.id, data);
        if (result.success) {
            toast({ title: "Sucesso!", description: "Veículo adicionado." });
            await refreshUser();
            onSuccess();
            form.reset();
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
        setIsSubmitting(false);
    };

    return (
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
                {user?.isPremium && (
                    <FormField control={form.control} name="plate" render={({ field }) => (
                        <FormItem><FormLabel>Placa (Opcional)</FormLabel><FormControl><Input placeholder="ABC1D23" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Veículo
                </Button>
            </form>
        </Form>
    );
}

export function VehicleManagerCard() {
    const { user, refreshUser } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (vehicleId: string) => {
        if (!user) return;
        setIsDeleting(vehicleId);
        const result = await deleteVehicle(user.id, vehicleId);
        if (result.success) {
            toast({ title: "Sucesso", description: "Veículo removido." });
            await refreshUser();
        } else {
            toast({ title: "Erro", description: result.error, variant: "destructive" });
        }
        setIsDeleting(null);
    };
    
    const canAddVehicle = user?.isPremium || (user?.vehicles && user.vehicles.length < 1);

    const AddVehicleButton = () => {
        if(canAddVehicle) {
            return (
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar
                    </Button>
                </DialogTrigger>
            )
        }
        return (
            <Link href="/premium" passHref>
                <Button>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Adicionar Mais</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        )
    }

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Car className="h-6 w-6 text-primary" />
                        Gerenciar Veículos
                    </CardTitle>
                    <CardDescription>
                        Adicione ou remova os veículos que você utiliza.
                    </CardDescription>
                </div>
                <AddVehicleButton />
            </CardHeader>
            <CardContent className="space-y-4">
                {user?.vehicles?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum veículo cadastrado.</p>
                ) : (
                    user?.vehicles?.map((v: Vehicle) => (
                        <Card key={v.id} className="p-4 flex items-center justify-between bg-secondary/50">
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-8 rounded-sm" style={{ backgroundColor: v.color.toLowerCase() }} />
                                <div>
                                    <p className="font-bold">{v.brand} {v.model}</p>
                                    <p className="text-sm text-muted-foreground">{v.plate || 'Sem placa'}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} disabled={!!isDeleting}>
                                {isDeleting === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive"/>}
                            </Button>
                        </Card>
                    ))
                )}
            </CardContent>
        </Card>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Adicionar Novo Veículo</DialogTitle>
                <DialogDescription>
                    Preencha os dados do seu veículo.
                </DialogDescription>
            </DialogHeader>
            <VehicleForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
        </Dialog>
    );
}
