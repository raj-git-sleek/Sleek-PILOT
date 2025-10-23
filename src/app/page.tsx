'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { AIPlanner } from '@/components/dashboard/ai-planner';
import { DailyPlanDisplay } from '@/components/dashboard/daily-plan-display';
import { GoalSetter } from '@/components/dashboard/goal-setter';
import { NotesSection } from '@/components/dashboard/notes-section';
import { ProgressTracker } from '@/components/dashboard/progress-tracker';
import { TaskManager } from '@/components/dashboard/task-manager';
import { SecureDocuments } from '@/components/dashboard/secure-documents';
import { ResearchSection } from '@/components/dashboard/research-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Task, Goal, Note, Project } from '@/lib/types';

import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, Query } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  // Sign in user anonymously if not logged in
  useEffect(() => {
    if (!user && !isUserLoading && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Fetch projects for the current user
  const projectsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'projects') as Query;
  }, [user, firestore]);
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  // Set the first project as active by default
  useEffect(() => {
    if (!activeProject && projects && projects.length > 0) {
      setActiveProject(projects[0]);
    }
  }, [projects, activeProject]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user || !firestore) return;
    const projectCol = collection(firestore, 'users', user.uid, 'projects');
    const newProject = {
      name: newProjectName,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(projectCol, newProject);
    setActiveProject({ id: docRef.id, name: newProjectName });
    setNewProjectName('');
    setIsNewProjectDialogOpen(false);
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <Button onClick={handleCreateProject}>Create Project</Button>
              </div>
            </DialogContent>
          </Dialog>

          {projects && projects.length > 0 && (
             <Select
                value={activeProject?.id}
                onValueChange={(projectId) => {
                    const project = projects.find(p => p.id === projectId);
                    setActiveProject(project || null);
                }}
             >
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                    {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          )}
        </div>

        {isUserLoading || projectsLoading ? (
            <p>Loading projects...</p>
        ) : !activeProject ? (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found. Create one to get started!</p>
            </div>
        ) : (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:w-fit">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="secure">Secure</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid auto-rows-max items-start gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AI Day Planner</CardTitle>
                </CardHeader>
                <CardContent>
                  <AIPlanner projectId={activeProject.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressTracker projectId={activeProject.id} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                   <TaskManager projectId={activeProject.id} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="goals" className="mt-6">
            <GoalSetter projectId={activeProject.id} />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <NotesSection projectId={activeProject.id} />
          </TabsContent>
          <TabsContent value="research" className="mt-6">
            <ResearchSection projectId={activeProject.id} />
          </TabsContent>
          <TabsContent value="secure" className="mt-6">
            <SecureDocuments projectId={activeProject.id} />
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
}
