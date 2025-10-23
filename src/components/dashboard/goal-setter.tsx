'use client';

import type { Goal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Target, Trash2 } from 'lucide-react';
import type { GoalTimeframe } from '@/lib/types';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, Query } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


interface GoalSetterProps {
  projectId: string;
}

export function GoalSetter({ projectId }: GoalSetterProps) {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<GoalTimeframe>('Weekly');

  const { firestore } = useFirebase();
  const { user } = useUser();

  const goalsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/goals`),
    ) as Query;
  }, [user, firestore, projectId]);

  const { data: goals } = useCollection<Goal>(goalsQuery);

  const addGoal = () => {
    if (newGoalTitle.trim() === '' || !user || !firestore) return;
    const goalsCol = collection(firestore, `users/${user.uid}/projects/${projectId}/goals`);
    const newGoal = {
      title: newGoalTitle,
      timeframe: newGoalTimeframe,
      projectId,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(goalsCol, newGoal);
    setNewGoalTitle('');
  };

  const deleteGoal = (id: string) => {
    if (!user || !firestore) return;
    const goalDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/goals`, id);
    deleteDocumentNonBlocking(goalDoc);
  };

  const goalsByTimeframe = (timeframe: GoalTimeframe) =>
    goals?.filter((g) => g.timeframe === timeframe) || [];

  const timeframes: GoalTimeframe[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Goals</CardTitle>
        <CardDescription>Define your ambitions for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="New goal title..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
          />
          <Select
            value={newGoalTimeframe}
            onValueChange={(value: GoalTimeframe) => setNewGoalTimeframe(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addGoal} className="w-full sm:w-auto">Add Goal</Button>
        </div>

        <Accordion type="multiple" className="w-full" defaultValue={timeframes}>
          {timeframes.map((timeframe) => {
            const timeframeGoals = goalsByTimeframe(timeframe);
            if (timeframeGoals.length === 0) return null;
            return (
              <AccordionItem value={timeframe} key={timeframe}>
                <AccordionTrigger className="text-lg font-medium">{timeframe} Goals</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {timeframeGoals.map((goal) => (
                      <li key={goal.id} className="flex items-center gap-4 rounded-md bg-muted/50 p-3">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="flex-1">{goal.title}</span>
                        <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {(!goals || goals.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
                <p>No goals set for this project yet. Add one above to get started!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
