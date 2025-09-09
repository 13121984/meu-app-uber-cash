
"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PersonalExpense, getPersonalExpenses, deletePersonalExpense, deleteAllPersonalExpenses } from '@/services/personal-expense.service';
import { PersonalExpenseForm } from "./personal-expense-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, DollarSign, List, Loader2, CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const expenseCategories = [
    "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Contas", "Outros"
];

const SummaryCard = ({ title, value, description, icon: Icon, iconClassName }: { title: string; value: string; description: string; icon: React.ElementType, iconClassName?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${iconClassName}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export function PersonalExpenseTracker() {
  const router = useRouter();
  const [records, setRecords] = useState<PersonalExpense[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PersonalExpense | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
        const data = await getPersonalExpenses();
        setRecords(data);
    });
  }, []);

  const monthlyTotal = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return records
      .filter(r => new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear)
      .reduce((sum, record) => sum + record.amount, 0);
  }, [records]);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
    startTransition(async () => {
        const data = await getPersonalExpenses();
        setRecords(data);
    });
  }

  const handleEdit = (record: PersonalExpense) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  }
  
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deletePersonalExpense(id);
    if(result.success) {
      toast({ title: "Sucesso!", description: "Despesa apagada." });
      startTransition(async () => {
          const data = await getPersonalExpenses();
          setRecords(data);
      });
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
  }
  
  const handleDeleteAll = async () => {
    setIsDeleting(true);
    const result = await deleteAllPersonalExpenses();
    if(result.success) {
      toast({ title: "Sucesso!", description: "Todas as despesas foram apagadas." });
      setRecords([]);
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={(open) => {
        setIsFormOpen(open);
        if(!open) setSelectedRecord(null);
    }}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
            <SummaryCard 
                title="Gastos no Mês Atual"
                value={formatCurrency(monthlyTotal)}
                description={`${records.length} ${records.length === 1 ? 'despesa registrada' : 'despesas registradas'}`}
                icon={DollarSign}
                iconClassName="text-red-500"
            />
            <DialogTrigger asChild>
                <Button className="w-full h-full text-base">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Adicionar Despesa
                </Button>
            </DialogTrigger>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Histórico de Despesas</CardTitle>
                <CardDescription>Veja seus últimos lançamentos.</CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /> : (
                <div className="space-y-4">
                    {records.length > 0 ? (
                        records.slice(0, 10).map(record => (
                            <AlertDialog key={record.id}>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-bold">{record.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{record.category}</span>
                                            <span>{format(new Date(record.date), "dd/MM/yy", { locale: ptBR })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-destructive">{formatCurrency(record.amount)}</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)} disabled={isDeleting}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={isDeleting}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    </div>
                                </div>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso irá apagar permanentemente o registro de: <span className="font-bold">{record.description}</span>.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(record.id)} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting ? "Apagando..." : "Apagar"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ))
                    ) : (
                         <p className="text-center text-muted-foreground py-8">Nenhuma despesa registrada ainda.</p>
                    )}
                    {records.length > 0 && (
                        <div className="flex justify-end pt-4">
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="destructive" size="sm" disabled={isDeleting}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Apagar Tudo
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. Isso irá apagar permanentemente TODAS as suas despesas pessoais.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAll} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                            {isDeleting ? "Apagando..." : "Sim, apagar tudo"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                )}
            </CardContent>
        </Card>
      </div>

      <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedRecord ? 'Editar' : 'Adicionar'} Despesa Pessoal</DialogTitle>
                <DialogDescription>
                    Preencha os detalhes do seu gasto.
                </DialogDescription>
            </DialogHeader>
            <PersonalExpenseForm 
                onSuccess={handleSuccess} 
                initialData={selectedRecord}
                categories={expenseCategories}
            />
        </DialogContent>
    </Dialog>
  );
}
