
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarCheck, Gauge, Wrench, ArrowRight } from 'lucide-react';
import { getMaintenanceRecords, Maintenance } from '@/services/maintenance.service';
import { getWorkDays } from '@/services/work-day.service';
import Link from 'next/link';
import { format, differenceInDays, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Reminder {
  id: string;
  description: string;
  reason: string;
  isUrgent: boolean;
}

export function MaintenanceReminderCard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkReminders() {
      try {
        const maintenanceRecords = await getMaintenanceRecords();
        const workDays = await getWorkDays();
        
        const latestKm = workDays.length > 0 ? Math.max(...workDays.map(d => d.km)) : 0;
        
        const activeReminders: Reminder[] = [];
        
        maintenanceRecords.forEach(record => {
          // Lembrete por Data
          if (record.reminderDate) {
            const today = new Date();
            const reminderDate = new Date(record.reminderDate);
            const daysUntilReminder = differenceInDays(reminderDate, today);

            if (isBefore(reminderDate, today) || daysUntilReminder <= 7) {
                activeReminders.push({
                    id: record.id,
                    description: record.description,
                    reason: `Agendado para ${format(reminderDate, 'dd/MM/yyyy')}`,
                    isUrgent: isBefore(reminderDate, today) || daysUntilReminder <= 2
                });
            }
          }

          // Lembrete por KM
          if (record.kmAtService && record.reminderKm) {
              const targetKm = record.kmAtService + record.reminderKm;
              const kmRemaining = targetKm - latestKm;

              if (kmRemaining <= 500) {
                   activeReminders.push({
                    id: record.id,
                    description: record.description,
                    reason: `Vence em ${targetKm.toLocaleString('pt-BR')} km (${kmRemaining.toLocaleString('pt-BR')} km restantes)`,
                    isUrgent: kmRemaining <= 100
                });
              }
          }
        });
        
        setReminders(activeReminders);

      } catch (error) {
        console.error("Failed to check maintenance reminders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkReminders();
  }, []);

  if (isLoading || reminders.length === 0) {
    return null; // Não mostra nada se estiver carregando ou se não houver lembretes
  }

  return (
    <Card className="bg-amber-500/10 border-amber-500/20 animate-pulse">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
                Lembretes de Manutenção
            </CardTitle>
            <CardDescription>
                Você tem manutenções preventivas se aproximando. Verifique os detalhes para evitar problemas.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {reminders.map(reminder => (
                <div key={reminder.id} className="p-3 bg-card rounded-lg flex items-center justify-between gap-2">
                    <div>
                        <p className="font-bold">{reminder.description}</p>
                        <p className="text-sm text-muted-foreground">{reminder.reason}</p>
                    </div>
                     {reminder.isUrgent && <div className="text-xs font-bold uppercase text-red-500">URGENTE</div>}
                </div>
            ))}
            <Link href="/manutencao" passHref>
                <Button variant="outline" className="w-full">
                    Ver Detalhes na Manutenção
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </CardContent>
    </Card>
  );
}
