'use client';

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { type Task } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp, Query } from 'firebase/firestore';
import { subDays, format, startOfDay } from 'date-fns';

export function WeeklyProgress({ projectId }: { projectId: string }) {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const last7Days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }).map((_, i) => subDays(today, i));
  }, []);

  const tasksQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    const oneWeekAgo = subDays(startOfDay(new Date()), 7);
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/subtasks`),
      where('completed', '==', true),
      where('completedAt', '>=', oneWeekAgo)
    ) as Query;
  }, [user, firestore, projectId]);
  
  const { data: completedTasks } = useCollection<Task>(tasksQuery);

  const chartData = useMemo(() => {
    return last7Days.map(date => {
      const day = format(date, 'MMM d');
      const tasksOnDay = completedTasks?.filter(task =>
        task.completedAt && format(startOfDay((task.completedAt as unknown as Timestamp).toDate()), 'MMM d') === day
      ).length || 0;
      return { date: day, tasks: tasksOnDay };
    }).reverse();
  }, [completedTasks, last7Days]);

  return (
    <div className="h-[200px] w-full">
      <ChartContainer
        config={{
          tasks: {
            label: 'Tasks',
            color: 'hsl(var(--primary))',
          },
        }}
        className="h-full w-full"
      >
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 6)}
          />
           <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="tasks" fill="var(--color-tasks)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
