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

interface GoalSetterProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

export function GoalSetter({ goals, setGoals }: GoalSetterProps) {
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<GoalTimeframe>('Weekly');

  const addGoal = () => {
    if (newGoalTitle.trim() === '') return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      timeframe: newGoalTimeframe,
    };
    setGoals((prev) => [...prev, newGoal]);
    setNewGoalTitle('');
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const goalsByTimeframe = (timeframe: GoalTimeframe) =>
    goals.filter((g) => g.timeframe === timeframe);

  const timeframes: GoalTimeframe[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Setting</CardTitle>
        <CardDescription>Define your long-term and short-term ambitions.</CardDescription>
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
        {goals.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                <p>No goals set yet. Add one above to get started!</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
