export type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline?: Date;
};

export type GoalTimeframe = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type Goal = {
  id: string;
  title: string;
  timeframe: GoalTimeframe;
};

export type Note = {
  id: string;
  content: string;
  createdAt: Date;
};
