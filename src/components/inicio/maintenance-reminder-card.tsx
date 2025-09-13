
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { getMaintenanceRemindersAction, Reminder } from '@/app/inicio/actions';

export function MaintenanceReminderCard() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    }

    async function checkReminders() {
      setIsLoading(true);
      try {
        const activeReminders = await getMaintenanceRemindersAction(user!.id);
        setReminders(activeReminders);
      } catch (error) {
        console.error("Failed to fetch maintenance reminders:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkReminders();
  }, [user]);

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
