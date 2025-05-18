import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ChangeColumnTypeModal({
  children,
  targetColumn,
  onSubmit,
}: {
  children: React.ReactNode;
  targetColumn: string;
  onSubmit: (targetColumn: string, prompt: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(
    'Classify a student with major in @Major as an engineer or non-engineer?'
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create AI-triggered column</DialogTitle>
          <DialogDescription>
            Create a prompt that will be sent to the AI tool and generate each
            cell's value.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p>
            All cells in the target column ({targetColumn}) will be updated with
            the new AI-generated content.
          </p>
          <p>Prompt:</p>
          <div className="flex space-x-2">
            <Textarea
              value={prompt}
              placeholder="Enter prompt to generate content for all cells"
              onChange={(e) => setPrompt(e.target.value)}
              disabled={true}
              className="min-h-[80px]"
            />
            <Button onClick={() => onSubmit(targetColumn, prompt)}>
              Apply to All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
