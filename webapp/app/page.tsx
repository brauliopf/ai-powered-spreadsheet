import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CreateSheetModal from '@/components/create-sheet-modal';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          AI-Powered Spreadsheet
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create intelligent spreadsheets with AI-powered cells that analyze and
          transform your data automatically.
        </p>

        <div className="mt-8">
          <CreateSheetModal>
            <Button size="lg" className="text-lg px-8 py-6">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a new research sheet
            </Button>
          </CreateSheetModal>
        </div>
      </div>
    </main>
  );
}
