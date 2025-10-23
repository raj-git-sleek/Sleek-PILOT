'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, FileText, KeyRound } from 'lucide-react';

interface SecureDocumentsProps {
  projectId: string;
  // This component will manage its own auth state for now
}

const CORRECT_PIN = '1367';

export function SecureDocuments({ projectId }: SecureDocumentsProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const handlePinUnlock = () => {
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      toast({
        title: 'Access Granted',
        description: 'You have successfully unlocked your secure documents for this project.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect PIN',
        description: 'The PIN you entered is incorrect. Please try again.',
      });
    }
    setPin('');
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="text-primary" /> Secure Area
          </CardTitle>
          <CardDescription>
            This area contains sensitive information for project. Please enter your 4-digit PIN to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            type="password"
            maxLength={4}
            placeholder="****"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-[1rem]"
            onKeyDown={(e) => e.key === 'Enter' && handlePinUnlock()}
          />
          <Button onClick={handlePinUnlock}>Unlock</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-green-500" /> Secure Documents
        </CardTitle>
        <CardDescription>
          Store your company licenses, tax documents, API keys, and passwords securely for this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle className="flex items-center gap-2"><FileText /> Legal Documents</AlertTitle>
          <AlertDescription>
            Upload and manage company licenses, tax forms, and other legal paperwork.
            <Button variant="outline" size="sm" className="mt-2">Upload Document</Button>
          </AlertDescription>
        </Alert>
        <Alert>
          <AlertTitle className="flex items-center gap-2"><KeyRound /> Credentials</AlertTitle>
          <AlertDescription>
            Securely store API keys, passwords, and other sensitive credentials.
            <Button variant="outline" size="sm" className="mt-2">Add Credential</Button>
          </AlertDescription>
        </Alert>
        {/* Placeholder for document list */}
        <div className="text-center text-muted-foreground py-8 border-t mt-6">
            <p>No documents or credentials stored yet for this project.</p>
        </div>
      </CardContent>
    </Card>
  );
}
