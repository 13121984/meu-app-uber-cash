import { GoalForm } from '@/components/metas/goal-form';
import { getGoals } from '@/services/goal.service';

export default async function MetasPage() {
  const goals = await getGoals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planejamento</h1>
        <p className="text-muted-foreground">Defina e acompanhe suas metas financeiras de lucro.</p>
      </div>
      <GoalForm initialData={goals} />
    </div>
  );
}
