'use client';

import type { Goal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarIcon, Target, Trash2 } from 'lucide-react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, Query } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


interface GoalSetterProps {
  projectId: string;
}

export function GoalSetter({ projectId }: GoalSetterProps) {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState<Date | undefined>();

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
      deadline: newGoalDeadline,
      projectId,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(goalsCol, newGoal);
    setNewGoalTitle('');
    setNewGoalDeadline(undefined);
  };

  const deleteGoal = (id: string) => {
    if (!user || !firestore) return;
    const goalDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/goals`, id);
    deleteDocumentNonBlocking(goalDoc);
  };


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
          <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={'outline'}
                className={cn(
                    'w-full justify-start text-left font-normal sm:w-[240px]',
                    !newGoalDeadline && 'text-muted-foreground'
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newGoalDeadline ? format(newGoalDeadline, 'PPP') : <span>Pick a deadline</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                mode="single"
                selected={newGoalDeadline}
                onSelect={setNewGoalDeadline}
                initialFocus
                />
            </PopoverContent>
          </Popover>
          <Button onClick={addGoal} className="w-full sm:w-auto">Add Goal</Button>
        </div>

        {goals && goals.length > 0 ? (
            <ul className="space-y-2">
            {goals.map((goal) => (
                <li key={goal.id} className="flex items-center gap-4 rounded-md bg-muted/50 p-3">
                <Target className="h-5 w-5 text-primary" />
                <span className="flex-1">{goal.title}</span>
                {goal.deadline && (
                  <span className="text-xs text-muted-foreground">
                    {/* @ts-ignore */}
                    {goal.deadline.toDate ? format(goal.deadline.toDate(), 'MMM d, yyyy') : format(goal.deadline, 'MMM d, yyyy')}
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                </li>
            ))}
            </ul>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>No goals set for this project yet. Add one above to get started!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
