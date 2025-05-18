'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { FileText, Grid } from 'lucide-react';

export default function CreateSheetModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCreateFromScratch = () => {
    setOpen(false);
    router.push('/spreadsheet/new');
  };

  const handleCreateFromTemplate = () => {
    setOpen(false);
    router.push('/spreadsheet/new?template=students-template');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new spreadsheet</DialogTitle>
          <DialogDescription>
            Choose how you want to start your new spreadsheet
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2 hover:bg-gray-100"
            onClick={handleCreateFromScratch}
          >
            <Grid className="h-8 w-8" />
            <span className="text-sm font-medium">
              Create sheet from scratch
            </span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-2 hover:bg-gray-100"
            onClick={handleCreateFromTemplate}
          >
            <FileText className="h-8 w-8" />
            <span className="text-sm font-medium">Create from templates</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
