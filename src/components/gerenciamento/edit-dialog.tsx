
"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RegistrationWizard } from "@/components/registrar/registration-wizard";
import type { WorkDay } from "@/services/work-day.service";

interface EditWorkDayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workDay: WorkDay | null;
}

// Este componente precisa ser "burro" e apenas renderizar o wizard
// O wizard em si vai ser modificado para aceitar dados iniciais
export function EditWorkDayDialog({ isOpen, onOpenChange, workDay }: EditWorkDayDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Registro de Trabalho</DialogTitle>
          <DialogDescription>
            Modifique os dados do dia de trabalho selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          {workDay && isOpen && (
              <RegistrationWizard 
                  initialData={workDay}
                  isEditing={true}
                  onSuccess={() => onOpenChange(false)}
              />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
