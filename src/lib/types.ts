export type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline?: Date;
  projectId: string;
};

export type GoalTimeframe = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type Goal = {
  id: string;
  title: string;
  timeframe: GoalTimeframe;
  projectId: string;
};

export type Note = {
  id: string;
  content: string;
  createdAt: Date;
  projectId: string;
};

export type Project = {
    id: string;
    name: string;
};
