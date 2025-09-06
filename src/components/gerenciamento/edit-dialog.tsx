
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RegistrationWizard } from "@/components/registrar/registration-wizard";
import type { WorkDay } from "@/services/work-day.service";
import type { GroupedWorkDay } from "@/app/gerenciamento/page";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2, Loader2, PlusCircle } from "lucide-react";
import { deleteWorkDayEntryAction } from "./actions";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";

interface EditWorkDayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupedWorkDay: GroupedWorkDay | null;
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Sub-componente para o formulário de edição de um único turno
function EditSingleEntryForm({ workDay, onCancel, onSuccess }: { workDay: WorkDay, onCancel: () => void, onSuccess: () => void }) {
    return (
        <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">Editando Período</h3>
            <RegistrationWizard 
                initialData={workDay}
                isEditing={true}
                onSuccess={() => {
                    onSuccess();
                    onCancel(); // Fecha o formulário de edição após o sucesso
                }}
            />
             <Button variant="outline" className="mt-4" onClick={onCancel}>Cancelar Edição</Button>
        </div>
    );
}


export function EditWorkDayDialog({ isOpen, onOpenChange, groupedWorkDay }: EditWorkDayDialogProps) {
  const router = useRouter();
  const [editingEntry, setEditingEntry] = useState<WorkDay | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleClose = () => {
    setEditingEntry(null);
    setIsAdding(false);
    onOpenChange(false);
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteWorkDayEntryAction(id);
    if(result.success) {
      toast({ title: "Sucesso!", description: "Período apagado." });
      router.refresh(); // Recarrega a página de gerenciamento
    } else {
      toast({ title: "Erro!", description: result.error, variant: "destructive" });
    }
    setDeletingId(null);
  }
  
  const handleSuccess = () => {
      router.refresh();
      // O formulário de edição já lida com o fechamento dele mesmo
  }

  if (!groupedWorkDay) return null;
  
  const entries = groupedWorkDay.entries;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes do Dia: {format(groupedWorkDay.date, 'dd/MM/yyyy (EEEE)', { locale: ptBR })}</DialogTitle>
          <DialogDescription>
            Gerencie os períodos de trabalho individuais para este dia.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
            {!editingEntry && !isAdding && (
                <div className="space-y-4 py-4">
                    {entries.map(entry => {
                        const earnings = entry.earnings.reduce((sum, e) => sum + e.amount, 0);
                        const fuel = entry.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
                        const profit = earnings - fuel;
                        return (
                            <Card key={entry.id}>
                                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-bold">Período de {entry.hours.toFixed(1)}h</p>
                                        <p className="text-sm text-muted-foreground">
                                            {entry.timeEntries.map(t => `${t.start}-${t.end}`).join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-green-500">{formatCurrency(profit)}</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingEntry(entry)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(entry.id)}>
                                            {deletingId === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                     <Button className="w-full mt-4" onClick={() => setIsAdding(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Novo Período
                    </Button>
                </div>
            )}
            
            {editingEntry && (
                <EditSingleEntryForm 
                    workDay={editingEntry}
                    onCancel={() => setEditingEntry(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {isAdding && (
                 <div className="my-4">
                    <h3 className="text-lg font-semibold mb-2">Adicionando Novo Período</h3>
                    <RegistrationWizard 
                        registrationType="other-day"
                        initialData={{ date: groupedWorkDay.date }}
                        isEditing={false}
                        onSuccess={() => {
                            handleSuccess();
                            setIsAdding(false);
                        }}
                    />
                    <Button variant="outline" className="mt-4" onClick={() => setIsAdding(false)}>Cancelar</Button>
                </div>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
