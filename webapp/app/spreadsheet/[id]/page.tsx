'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import SpreadsheetGrid from '@/components/spreadsheet-grid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { templates } from '@/lib/templates';

export default function SpreadsheetPage() {
  const [columns, setColumns] = useState<
    Record<string, 'regular' | 'ai-trigger'>
  >({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [spreadsheetName, setSpreadsheetName] =
    useState<string>('New Spreadsheet');

  // Navigation hooks
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const templateParam = searchParams.get('template');

  // Load template if URL is /new and template parameter exists
  useEffect(() => {
    async function loadTemplate() {
      if (pathname.endsWith('/new') && templateParam) {
        try {
          // Dynamic import to load the template
          const template = templates[templateParam as keyof typeof templates];

          if (template) {
            console.log('DEBUG: template', template.columns);
            // Set data from template
            setColumns(
              template.columns as Record<string, 'regular' | 'ai-trigger'>
            );
            setRows(template.rows || []);
            setSpreadsheetName(template.name || 'New Spreadsheet');
          }
        } catch (error) {
          console.error(`Failed to load template: ${templateParam}`, error);
        }
      }
    }

    loadTemplate();
  }, [pathname, templateParam]);

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
    // if switching to regular, just switch
    if (columns[columnName] === 'ai-trigger') {
      setColumns({ ...columns, [columnName]: 'regular' });
      return;
    }

    // if switching to ai-trigger: set AI function, run it, and update the column type
    if (columns[columnName] === 'regular') {
      try {
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
