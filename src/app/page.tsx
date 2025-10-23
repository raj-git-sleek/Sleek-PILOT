'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { AIPlanner } from '@/components/dashboard/ai-planner';
import { DailyPlanDisplay } from '@/components/dashboard/daily-plan-display';
import { GoalSetter } from '@/components/dashboard/goal-setter';
import { NotesSection } from '@/components/dashboard/notes-section';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { TaskManager } from '@/components/dashboard/task-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task, Goal, Note } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dailyPlan, setDailyPlan] = useState<string>('');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-fit">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid auto-rows-max items-start gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AI Day Planner</CardTitle>
                </CardHeader>
                <CardContent>
                  <AIPlanner setDailyPlan={setDailyPlan} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressTracker tasks={tasks} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskManager tasks={tasks} setTasks={setTasks} />
                </CardContent>
              </Card>

              {dailyPlan && (
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Generated Daily Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DailyPlanDisplay plan={dailyPlan} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="goals" className="mt-6">
            <GoalSetter goals={goals} setGoals={setGoals} />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <NotesSection notes={notes} setNotes={setNotes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
