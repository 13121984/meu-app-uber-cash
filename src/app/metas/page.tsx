import { GoalPlanner } from '@/components/metas/goal-planner';

export default async function MetasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Planejamento de Metas</h1>
        <p className="text-muted-foreground">Defina sua meta de lucro mensal e sua rotina para calcularmos seus objetivos.</p>
      </div>
      <GoalPlanner />
    </div>
  );
}
