'use client';

import type React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import SpreadsheetGrid from '@/components/spreadsheet-grid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { templates } from '@/lib/templates';

type ColumnConfig = {
  type: 'regular' | 'ai-trigger';
  prompt?: string;
};

export default function SpreadsheetPage() {
  const [columns, setColumns] = useState<Record<string, ColumnConfig>>({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [spreadsheetName, setSpreadsheetName] =
    useState<string>('New Spreadsheet');
  const processedRef = useRef<Record<string, boolean>>({});
  const [targetColumnTypeDialog, setTargetColumnTypeDialog] =
    useState<string>('');
  const [isDialogColumnTypeOpen, setIsDialogColumnTypeOpen] = useState(false);

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
            // Set data from template
            setColumns(template.columns as Record<string, ColumnConfig>);
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

  useEffect(() => {
    const columnKey = JSON.stringify(columns);
    if (processedRef.current[columnKey]) return;

    async function runAiFunctions() {
      // find ai-trigger columns
      const aiTriggerColumns = Object.keys(columns).filter(
        (column) => columns[column].type === 'ai-trigger'
      );

      if (aiTriggerColumns.length === 0 || rows.length === 0) return;

      // Create a deep copy of rows to avoid mutation
      const updatedRows = rows.map((row) => ({ ...row }));
      let hasUpdates = false;

      // get prompt for each ai-trigger column + execute prompt for each row
      for (const column of aiTriggerColumns) {
        const promptTemplate = columns[column].prompt;
        if (!promptTemplate) {
          console.error(`No prompt found for column: ${column}`);
          continue;
        }

        // Process each row
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          // Build prompt for this row by replacing @ColumnName placeholders
          let prompt = promptTemplate;
          const row = rows[rowIdx];

          // Find column references in the prompt and replace them
          const referredColumns = (
            promptTemplate.match(/@([a-zA-Z0-9_]+)/g) || []
          ).map((name) => name.substring(1));

          for (const columnName of referredColumns) {
            const value = row[columnName] || '';
            prompt = prompt.replace(`@${columnName}`, value);
          }

          // Get LLM completion
          const response = await fetch('/api/ai-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });

          // Assign output values to our updatedRows array
          if (response.ok) {
            const data = await response.text();
            try {
              const jsonData = JSON.parse(data);
              console.log(
                'DEBUG: jsonData received for row',
                rowIdx,
                'column',
                column,
                ':',
                jsonData
              );

              // Extract the value and ensure it's a string
              const aiValue =
                jsonData.isEngineer !== undefined
                  ? String(jsonData.isEngineer)
                  : JSON.stringify(jsonData).substring(0, 50);

              console.log('DEBUG: setting cell value to', aiValue);

              updatedRows[rowIdx] = {
                ...updatedRows[rowIdx],
                [column]: aiValue,
              };
              hasUpdates = true;
            } catch (e) {
              console.error('Failed to parse response as JSON', e);
            }
          }
        }
      }

      // Only update state if we have changes
      if (hasUpdates) {
        console.log('DEBUG: updating rows with', updatedRows);
        setRows(updatedRows);
      }
    }

    runAiFunctions();
    processedRef.current[columnKey] = true;
  }, [columns, rows]);

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
    setColumns({ ...columns, [newColName]: { type: 'regular' } });

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
    console.log('DEBUG: updating cell', rowIndex, columnName, value);
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [columnName]: value,
    };
    console.log('DEBUG: updated cell', newRows);
    setRows(newRows);

    // Check if this column is referenced by any AI-trigger columns
    const aiTriggerColumns = Object.keys(columns).filter((col) => {
      // Check if this column is an AI-trigger column
      if (columns[col].type !== 'ai-trigger') return false;

      // Check if its prompt references the column that was just updated
      const prompt = columns[col].prompt || '';
      return prompt.includes(`@${columnName}`);
    });

    // If this column affects any AI-trigger columns, reset processed state to trigger reevaluation
    if (aiTriggerColumns.length > 0) {
      console.log(
        `Cell update in ${columnName} affects AI columns:`,
        aiTriggerColumns
      );

      // Clear the processed state to force AI reassessment
      processedRef.current = {};

      // Update columns slightly to trigger the useEffect
      setColumns({ ...columns });
    }
  };

  const toggleColumnType = (columnName: string, prompt: string) => {
    // if switching to regular, just switch
    if (columns[columnName].type === 'ai-trigger') {
      setColumns({ ...columns, [columnName]: { type: 'regular' } });
      return;
    }

    // if switching to ai-trigger: set AI function, run it, and update the column type
    if (columns[columnName].type === 'regular') {
      try {
        // Set the column type to AI-trigger with the provided prompt
        setColumns({
          ...columns,
          [columnName]: { type: 'ai-trigger', prompt },
        });

        // Reset the processed state for this column configuration
        processedRef.current = {};
      } catch (error) {
        console.error(error);
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
