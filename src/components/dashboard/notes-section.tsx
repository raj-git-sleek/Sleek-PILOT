'use client';

import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Paperclip, Trash2, Image as ImageIcon } from 'lucide-react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, Query } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface NotesSectionProps {
  projectId: string;
}

export function NotesSection({ projectId }: NotesSectionProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const { firestore } = useFirebase();
  const { user } = useUser();

  const notesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/notes`),
    ) as Query;
  }, [user, firestore, projectId]);

  const { data: notes } = useCollection<Note>(notesQuery);

  const addNote = () => {
    if (newNoteContent.trim() === '' || !user || !firestore) return;
    const notesCol = collection(firestore, `users/${user.uid}/projects/${projectId}/notes`);
    const newNote = {
      content: newNoteContent,
      createdAt: serverTimestamp(),
      projectId,
    };
    addDocumentNonBlocking(notesCol, newNote);
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    if (!user || !firestore) return;
    const noteDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/notes`, id);
    deleteDocumentNonBlocking(noteDoc);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
        <CardDescription>A place for your random thoughts, ideas, and files for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="What's on your mind?"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Paperclip /> Attach File</Button>
              <Button variant="outline" size="sm"><ImageIcon /> Add Image</Button>
            </div>
            <Button onClick={addNote}>Add Note</Button>
          </div>
        </div>
        <ScrollArea className="h-96 rounded-md border">
            <div className="p-4 space-y-4">
            {notes && notes.length > 0 ? (
                notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-md bg-muted/50">
                        <div className="flex justify-between items-start">
                        <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                        <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {/* @ts-ignore */}
                          {note.createdAt?.toDate ? format(note.createdAt.toDate(), 'PPp') : 'Just now'}
                        </p>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No notes for this project yet. Add your first note above.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
