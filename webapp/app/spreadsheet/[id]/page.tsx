'use client';

import type React from 'react';
import { useState } from 'react';
import SpreadsheetGrid from '@/components/spreadsheet-grid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function SpreadsheetPage() {
  const [columns, setColumns] = useState<
    Record<string, 'regular' | 'ai-trigger'>
  >({}); // map of column name to type
  const [rows, setRows] = useState<Record<string, string>[]>([]); // map of column name to value

  // UI state
  const [targetColumnTypeDialog, setTargetColumnTypeDialog] = useState<
    string | null
  >(null);
  const [isDialogColumnTypeOpen, setIsDialogColumnTypeOpen] = useState(false);
  const [spreadsheetName, setSpreadsheetName] =
    useState<string>('New Spreadsheet');

  // Local Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpreadsheetName(e.target.value);
  };
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.trim()) {
      setSpreadsheetName('New Spreadsheet'); // default name if left blank
    }
  };

  // Remote Handlers
  const addColumn = () => {
    const newColName = `Column ${Object.keys(columns).length + 1}`;
    setColumns({ ...columns, [newColName]: 'regular' });

    // Add empty value for this column to all existing rows
    const updatedRows = rows.map((row) => ({
      ...row,
      [newColName]: '',
    }));
    setRows(updatedRows);
  };

  const addRow = () => {
    const newRow: Record<string, string> = {};
    const colNames = Object.keys(columns);
    for (const col of colNames) {
      newRow[col] = '';
    }
    setRows([...rows, newRow]);
  };

  const updateCell = (rowIndex: number, columnName: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [columnName]: value,
    };
    setRows(newRows);
  };

  const toggleColumnType = (columnName: string, prompt: string) => {
    console.log('toggleColumnType: START', columnName, prompt);
    // if switching to regular, just switch
    if (columns[columnName] === 'ai-trigger') {
      setColumns({ ...columns, [columnName]: 'regular' });
      return;
    }

    // if switching to ai-trigger: set AI function, run it, and update the column type
    if (columns[columnName] === 'regular') {
      // display a modal with a brief explanation of the column type and a text input
      const aiFunctionDescription = `This column is used to trigger an AI function. For now, the AI is configured to respond TRUE/FALSE and give a reasoning. Please provide a prompt for the AI to respond to. You can refer to other columns with 
      "@COLUMN_NAME".`;

      try {
        console.log('HERE!!!', columnName, prompt);
      } catch (error) {
        // console.error(error);
      }

      // Open the dialog and set target column
      setTargetColumnTypeDialog(columnName);
      setIsDialogColumnTypeOpen(true);
      return; // Don't toggle type yet, wait for dialog input
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
            <input
              type="text"
              value={spreadsheetName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SpreadsheetGrid
            columns={columns}
            rows={rows}
            onUpdateCell={updateCell}
            onToggleColumnType={toggleColumnType}
            onAddRow={addRow}
            onAddColumn={addColumn}
          />
        </div>
      </main>
    </div>
  );
}

// // parse the prompt to get the column references
// const prompt = inputDialogChangeTypeValue;
// const columnReferences = prompt.match(/@[a-zA-Z]+/g); // @Major, @Name, etc.

// if (targetDialogColumn) {
//   console.log('targetDialogColumn', prompt, rows, targetDialogColumn);
//   // Update all cells in the column
//   rows.forEach((_, rowIndex) => {
//     onUpdateCell(rowIndex, targetDialogColumn, inputValue);
//   });
//   setInputValue('');
//   setIsDialogColumnTypeOpen(false);
// }
