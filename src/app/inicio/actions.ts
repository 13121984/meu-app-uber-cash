'use server';

import { getMaintenanceRecords, Maintenance } from '@/services/maintenance.service';
import { getWorkDays } from '@/services/work-day.service';
import { format, differenceInDays, isBefore } from 'date-fns';

export interface Reminder {
  id: string;
  description: string;
  reason: string;
  isUrgent: boolean;
}

export async function getMaintenanceRemindersAction(userId: string): Promise<Reminder[]> {
  try {
    const maintenanceRecords = await getMaintenanceRecords(userId);
    const workDays = await getWorkDays(userId);

    // Encontra o KM mais recente registrado em qualquer dia de trabalho
    const latestKm = workDays.length > 0 
        ? workDays.reduce((maxKm, day) => Math.max(maxKm, day.km), 0)
        : 0;

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
            isUrgent: isBefore(reminderDate, today) || daysUntilReminder <= 2,
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
            reason: `Vence em ${targetKm.toLocaleString(
              'pt-BR'
            )} km (${kmRemaining.toLocaleString('pt-BR')} km restantes)`,
            isUrgent: kmRemaining <= 100,
          });
        }
      }
    });

    // Remove duplicados se um lembrete de data e KM forem para o mesmo serviço
    const uniqueReminders = Array.from(new Map(activeReminders.map(r => [r.id, r])).values());
    
    return uniqueReminders;
  } catch (error) {
    console.error("Failed to check maintenance reminders:", error);
    return []; // Retorna um array vazio em caso de erro
  }
}
