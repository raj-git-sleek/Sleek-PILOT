'use client';

import type { ResearchItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Paperclip, Trash2, FileText } from 'lucide-react';
import { useFirebase, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, query, Query } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface ResearchSectionProps {
  projectId: string;
}

export function ResearchSection({ projectId }: ResearchSectionProps) {
  const [newResearchText, setNewResearchText] = useState('');
  const { firestore } = useFirebase();
  const { user } = useUser();

  const researchQuery = useMemoFirebase(() => {
    if (!user || !firestore || !projectId) return null;
    return query(
      collection(firestore, `users/${user.uid}/projects/${projectId}/research`),
    ) as Query;
  }, [user, firestore, projectId]);

  const { data: researchItems } = useCollection<ResearchItem>(researchQuery);

  const addResearchNote = () => {
    if (newResearchText.trim() === '' || !user || !firestore) return;
    const researchCol = collection(firestore, `users/${user.uid}/projects/${projectId}/research`);
    const newResearchItem = {
      content: newResearchText,
      createdAt: serverTimestamp(),
      projectId,
    };
    addDocumentNonBlocking(researchCol, newResearchItem);
    setNewResearchText('');
  };

  const deleteResearchItem = (id: string) => {
    if (!user || !firestore) return;
    const researchDoc = doc(firestore, `users/${user.uid}/projects/${projectId}/research`, id);
    deleteDocumentNonBlocking(researchDoc);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Research</CardTitle>
        <CardDescription>Consolidate your research notes, articles, and documents for this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste research text or notes here..."
            value={newResearchText}
            onChange={(e) => setNewResearchText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Paperclip /> Attach File</Button>
            </div>
            <Button onClick={addResearchNote}>Add Research Note</Button>
          </div>
        </div>
        <ScrollArea className="h-96 rounded-md border">
            <div className="p-4 space-y-4">
            {researchItems && researchItems.length > 0 ? (
                researchItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-md bg-muted/50">
                        <div className="flex justify-between items-start">
                        {item.content && <p className="text-sm whitespace-pre-wrap flex-1">{item.content}</p>}
                        {item.fileName && (
                          <div className="flex-1 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">{item.fileName}</span>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteResearchItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {/* @ts-ignore */}
                          {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'PPp') : 'Just now'}
                        </p>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No research items for this project yet. Add notes or files above.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
