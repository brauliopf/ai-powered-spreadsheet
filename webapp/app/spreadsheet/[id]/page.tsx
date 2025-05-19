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
  // State
  const [columns, setColumns] = useState<Record<string, ColumnConfig>>({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [spreadsheetName, setSpreadsheetName] =
    useState<string>('New Spreadsheet');
  const processedRows = useRef<Set<string>>(new Set()); // use concatenated row values as keys for the set

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

  // useCallback to avoid re-rendering the component when the columns change
  const getRowId = useCallback(
    (row: Record<string, string>, idx = 0) => {
      const regularColumns = Object.keys(columns).filter(
        (column) => columns[column].type === 'regular' && row[column]
      );
      const rowKey = regularColumns.map((column) => row[column]).join('-');
      return `${idx}-${rowKey}`;
    },
    [columns]
  );

  // Run AI Functions when columns or rows change. Keep track of processed rows with useRef
  useEffect(() => {
    // find ai-trigger columns. return if none.
    const aiTriggerColumns = Object.keys(columns).filter(
      (column) => columns[column].type === 'ai-trigger'
    );
    if (aiTriggerColumns.length === 0 || rows.length === 0) return;

    async function runAiFunctions() {
      // Create a deep copy of rows to preserve the original data.
      const updatedRows = rows.map((row) => ({ ...row }));
      let hasUpdates = false;

      // get prompt template for each column + execute prompt for each row
      for (const column of aiTriggerColumns) {
        // get prompt template
        const promptTemplate = columns[column].prompt;
        if (!promptTemplate) {
          console.error(`No prompt found for column: ${column}`);
          continue;
        }

        // build prompt with row values (execute template)
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          // skip if row has already been processed
          const rowKey = getRowId(rows[rowIdx], rowIdx);
          if (processedRows.current.has(rowKey)) continue;

          // build prompt for this row by replacing @ColumnName placeholders
          let prompt = promptTemplate;
          const row = updatedRows[rowIdx];

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

          // Assign output values to updatedRows array
          if (response.ok) {
            const data = await response.text();
            try {
              const jsonData = JSON.parse(data);

              // Extract the value and ensure it's a string
              const aiValue =
                jsonData.isEngineer !== undefined
                  ? String(jsonData.isEngineer)
                  : JSON.stringify(jsonData).substring(0, 50);

              // Update the row with the AI value
              updatedRows[rowIdx] = {
                ...updatedRows[rowIdx],
                [column]: aiValue,
              };
              hasUpdates = true;
              processedRows.current.add(getRowId(rows[rowIdx], rowIdx));
            } catch (e) {
              console.error('Failed to parse response as JSON', e);
            }
          }
        }
      }

      // Only update state if we have changes
      if (hasUpdates) {
        setRows(updatedRows);
      }
    }

    runAiFunctions();
  }, [columns, rows, getRowId]);

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
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [columnName]: value,
    };
    setRows(newRows);

    // Check if this column affects any AI-trigger columns
    const aiTriggerColumns = Object.keys(columns).filter((col) => {
      // Check if this column is an AI-trigger column
      if (columns[col].type !== 'ai-trigger') return false;

      // Check if its prompt references the column that was just updated
      const prompt = columns[col].prompt || '';
      return prompt.includes(`@${columnName}`);
    });

    // If this column affects any AI-trigger columns,
    // reset processed state for the respective row to trigger reevaluation
    if (aiTriggerColumns.length > 0) {
      console.log(
        `Cell update in row (${rowIndex}, ${columnName}) affects AI columns:`,
        aiTriggerColumns
      );

      // Clear the processed state to force AI reassessment
      processedRows.current.delete(getRowId(rows[rowIndex], rowIndex));

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
        processedRows.current = new Set();
      } catch (error) {
        console.error(error);
      }

      // Open the dialog and set target column
      // setTargetColumnTypeDialog(columnName);
      // setIsDialogColumnTypeOpen(true);
      return; // Don't toggle type yet, wait for dialog input
    }
  };

  const triggerAIFunction = async (rowIndex: number, columnName: string) => {
    // get prompt template for columnName
    const promptTemplate = columns[columnName].prompt;
    if (!promptTemplate) {
      console.error(`No prompt found for column: ${columnName}`);
      return;
    }

    // build prompt with row values (execute template)
    let prompt = promptTemplate;
    const row = rows[rowIndex];

    // Find column references in the prompt and replace them
    const referredColumns = (
      promptTemplate.match(/@([a-zA-Z0-9_]+)/g) || []
    ).map((name) => name.substring(1));

    for (const columnName of referredColumns) {
      const value = row[columnName] || '';
      prompt = prompt.replace(`@${columnName}`, value);
    }

    // get LLM completion
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    // update cell value
    if (response.ok) {
      const data = await response.text();
      const jsonData = JSON.parse(data);
      const aiValue =
        jsonData.isEngineer !== undefined
          ? String(jsonData.isEngineer)
          : JSON.stringify(jsonData).substring(0, 50);
      updateCell(rowIndex, columnName, aiValue);
    } else {
      console.error('Failed to get AI response', response.statusText);
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
            onGetRowId={getRowId}
            onUpdateCell={updateCell}
            onToggleColumnType={toggleColumnType}
            onAddRow={addRow}
            onAddColumn={addColumn}
            onTriggerAIFunction={triggerAIFunction}
          />
        </div>
      </main>
    </div>
  );
}
