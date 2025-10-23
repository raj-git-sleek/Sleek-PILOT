'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, where, Query } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface TaskManagerProps {
  projectId: string;
}

export function TaskManager({ projectId }: TaskManagerProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const { firestore } = useFirebase();
  const { user } = useUser();

  const tasksQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/subtasks`),
    ) as Query;
  }, [user, firestore, projectId]);

  const { data: tasks } = useCollection<Task>(tasksQuery);

  const addTask = () => {
    if (newTaskText.trim() === '' || !user || !firestore) return;
    const tasksCol = collection(firestore, `users/${user.uid}/projects/${projectId}/subtasks`);
    const newTask = {
      text: newTaskText.trim(),
      completed: false,
      deadline,
      projectId,
      createdAt: serverTimestamp(),
      completedAt: null,
    };
    addDocumentNonBlocking(tasksCol, newTask);
    setNewTaskText('');
    setDeadline(undefined);
  };

  const toggleTask = (id: string, completed: boolean) => {
    if (!user || !firestore) return;
    const taskDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/subtasks`, id);
    updateDocumentNonBlocking(taskDoc, { 
      completed: !completed,
      completedAt: !completed ? serverTimestamp() : null,
    });
  };

  const deleteTask = (id: string) => {
    if (!user || !firestore) return;
    const taskDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/subtasks`, id);
    deleteDocumentNonBlocking(taskDoc);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Add a new to-do or task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal sm:w-[240px]',
                !deadline && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, 'PPP') : <span>Pick a deadline</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button onClick={addTask} className="w-full sm:w-auto">Add Task</Button>
      </div>

      <ScrollArea className="h-72 rounded-md border">
        <div className="p-4 space-y-2">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-md p-3 transition-colors hover:bg-muted/50 data-[completed=true]:bg-muted/30"
                data-completed={task.completed}
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id, task.completed)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    'flex-1 text-sm cursor-pointer',
                    task.completed && 'text-muted-foreground line-through'
                  )}
                >
                  {task.text}
                </label>
                {task.deadline && (
                  <span className="text-xs text-muted-foreground">
                    {/* @ts-ignore */}
                    {task.deadline.toDate ? format(task.deadline.toDate(), 'MMM d') : format(task.deadline, 'MMM d')}
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>No tasks yet. Add one above to get started!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
