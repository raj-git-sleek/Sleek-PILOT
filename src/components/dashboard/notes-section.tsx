'use client';

import type { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface NotesSectionProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function NotesSection({ notes, setNotes }: NotesSectionProps) {
  const [newNoteContent, setNewNoteContent] = useState('');

  const addNote = () => {
    if (newNoteContent.trim() === '') return;
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      createdAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Notes</CardTitle>
        <CardDescription>A place for your random thoughts and ideas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="What's on your mind?"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          />
          <Button onClick={addNote}>Add Note</Button>
        </div>
        <ScrollArea className="h-96 rounded-md border">
            <div className="p-4 space-y-4">
            {notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    <p>No notes yet. Add your first note above.</p>
                </div>
            ) : (
                notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-md bg-muted/50">
                        <div className="flex justify-between items-start">
                        <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                        <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                        {format(note.createdAt, 'PPp')}
                        </p>
                    </div>
                ))
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
