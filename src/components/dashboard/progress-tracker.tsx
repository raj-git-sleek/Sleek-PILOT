'use client';
import { useMemo } from 'react';
import { Pie, PieChart } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { type Task } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, Query } from 'firebase/firestore';


export function ProgressTracker({ projectId }: { projectId: string }) {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const tasksQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/subtasks`),
    ) as Query;
  }, [user, firestore, projectId]);
  const { data: tasks } = useCollection<Task>(tasksQuery);

  const { completed, total, percentage } = useMemo(() => {
    if (!tasks) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    const total = tasks.length;
    if (total === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = tasks.filter((t) => t.completed).length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [tasks]);

  const chartData = [
    { name: 'Completed', value: completed, fill: 'hsl(var(--primary))' },
    { name: 'Pending', value: total - completed, fill: 'hsl(var(--muted))' },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
      <div className="relative h-[120px] w-[120px]">
        <ChartContainer config={{}} className="absolute inset-0">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={60}
              strokeWidth={2}
              startAngle={90}
              endAngle={450}
              paddingAngle={total > 1 ? 2 : 0}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {total > 0 ? `${percentage}%` : 'N/A'}
          </span>
        </div>
      </div>
      <p className="font-medium text-muted-foreground">
        {completed} of {total} tasks done
      </p>
    </div>
  );
}
