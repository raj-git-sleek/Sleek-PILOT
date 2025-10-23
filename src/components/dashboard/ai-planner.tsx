'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mic, Paperclip, Sparkles, Wand2 } from 'lucide-react';
import { generateDailyPlanFromData } from '@/ai/flows/generate-daily-plan-from-data';
import { organizeDataWithAI, type OrganizeDataWithAIOutput } from '@/ai/flows/organize-data-with-ai';
import { Task } from '@/lib/types';

interface AIPlannerProps {
  setDailyPlan: (plan: string) => void;
  setTasks: (tasks: Task[]) => void;
}

export function AIPlanner({ setDailyPlan, setTasks }: AIPlannerProps) {
  const [inputData, setInputData] = useState('');
  const [organizedResult, setOrganizedResult] = useState<OrganizeDataWithAIOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (action: 'organize' | 'plan') => {
    if (!inputData.trim()) {
      toast({
        title: 'Input is empty',
        description: 'Please provide some data to analyze.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        if (action === 'organize') {
          const result = await organizeDataWithAI({ inputData });
          setOrganizedResult(result);
          toast({
            title: 'Data Organized',
            description: 'Your input has been successfully categorized and summarized.',
          });
        } else {
          const result = await generateDailyPlanFromData({ data: inputData });
          setTasks(result.tasks);
          setDailyPlan(`Your new action items have been added to the "Action Items" card below.`);
           toast({
            title: 'Daily Plan Generated',
            description: 'Your new step-by-step plan is ready.',
          });
        }
      } catch (error) {
        console.error('AI action failed:', error);
        toast({
          title: 'An Error Occurred',
          description: `Failed to perform AI action. Please try again.`,
          variant: 'destructive',
        });
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          placeholder="Paste your unorganized notes, research, or ideas here..."
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          className="min-h-[120px]"
          disabled={isPending}
        />
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isPending}><Paperclip /> Attach File</Button>
            <Button variant="outline" size="sm" disabled={isPending}><Mic /> Use Voice</Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => handleAction('organize')} disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Organize Input
        </Button>
        <Button onClick={() => handleAction('plan')} disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Generate Daily Plan
        </Button>
      </div>
      {organizedResult && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Organized Data</CardTitle>
            <CardDescription>Here's what the AI understood from your input.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">Category</h4>
              <p>{organizedResult.category}</p>
            </div>
            <div>
              <h4 className="font-semibold">Tags</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {organizedResult.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Summary</h4>
              <p className="text-sm text-muted-foreground">{organizedResult.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
