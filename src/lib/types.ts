export type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline?: Date;
  projectId: string;
};

export type Goal = {
  id: string;
  title: string;
  deadline?: Date;
  projectId: string;
};

export type Note = {
  id: string;
  content: string;
  createdAt: Date;
  projectId: string;
};

export type ResearchItem = {
  id: string;
  content: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: Date;
  projectId: string;
};

export type Project = {
    id: string;
    name: string;
};
