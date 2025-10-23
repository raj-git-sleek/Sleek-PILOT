'use client';

interface DailyPlanDisplayProps {
  plan: string;
}

export function DailyPlanDisplay({ plan }: DailyPlanDisplayProps) {
  return (
    <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
        <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-sans text-sm">
            {plan}
        </div>
    </div>
  );
}
