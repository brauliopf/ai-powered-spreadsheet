'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import SpreadsheetGrid from '@/components/spreadsheet-grid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function SpreadsheetPage() {
  const [columnNames, setColumnNames] = useState<string[]>([]);
  const [columnTypes, setColumnTypes] = useState<
    Record<string, 'regular' | 'ai-trigger'>
  >({});
  const [rows, setRows] = useState<Record<string, string>[]>([]); // map of column name to value

  // UI state
  const [isDialogColumnTypeOpen, setIsDialogColumnTypeOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);

  // Local Handlers
  const [spreadsheetName, setSpreadsheetName] =
    useState<string>('New Spreadsheet');
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpreadsheetName(e.target.value);
  };
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.trim()) {
      setSpreadsheetName('New Spreadsheet'); // default name if left blank
    }
  };

  // Prop Handlers
  const addColumn = () => {
    const newColumnName = `Column ${columnNames.length + 1}`;
    setColumnNames([...columnNames, newColumnName]);
    setColumnTypes({ ...columnTypes, [newColumnName]: 'regular' });

    // Add empty value for this column to all existing rows
    const updatedRows = rows.map((row) => ({
      ...row,
      [newColumnName]: '',
    }));
    setRows(updatedRows);
  };

  const addRow = () => {
    const newRow: Record<string, string> = {};
    for (const col of columnNames) {
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

  const toggleColumnType = (columnName: string) => {
    // if switching to ai-trigger, get prompt
    if (columnTypes[columnName] === 'regular') {
      // display a modal with a brief explanation of the column type and a text input
      const aiFunctionDescription = `This column is used to trigger an AI function. For now, the AI is configured to respond TRUE/
      FALSE and give a reasoning. Please provide a prompt for the AI to respond to. You can refer to other columns with 
      "@COLUMN_NAME".`;

      try {
      } catch (error) {
        console.error(error);
      }

      // Open the dialog and set target column
      setTargetColumn(columnName);
      setIsDialogColumnTypeOpen(true);
      return; // Don't toggle type yet, wait for dialog input
    }

    // if switching to regular, just switch
    // switch column type
    setColumnTypes({
      ...columnTypes,
      [columnName]:
        // @ts-ignore
        columnTypes[columnName] === 'regular' ? 'ai-trigger' : 'regular',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
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
            columnNames={columnNames}
            rows={rows}
            columnTypes={columnTypes}
            onUpdateCell={updateCell}
            onToggleColumnType={toggleColumnType}
            onAddRow={addRow}
            onAddColumn={addColumn}
            isDialogColumnTypeOpen={isDialogColumnTypeOpen}
            setIsDialogColumnTypeOpen={setIsDialogColumnTypeOpen}
            targetColumn={targetColumn}
            setTargetColumn={setTargetColumn}
          />
        </div>
      </main>
    </div>
  );
}
