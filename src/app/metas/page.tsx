import { GoalForm } from '@/components/metas/goal-form';

export default async function MetasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planejamento</h1>
        <p className="text-muted-foreground">Defina e acompanhe suas metas financeiras de lucro.</p>
      </div>
      <GoalForm />
    </div>
  );
}
