'use client';

import { useState } from 'react';
import { Cell } from '@/components/cell';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface SpreadsheetGridProps {
  columnNames: string[];
  columnTypes: Record<string, 'regular' | 'ai-trigger'>;
  rows: Record<string, string>[];
  onUpdateCell: (rowIndex: number, columnName: string, value: string) => void;
  onToggleColumnType: (columnName: string, prompt: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  isDialogColumnTypeOpen: boolean;
  setIsDialogColumnTypeOpen: (isOpen: boolean) => void;
  targetDialogColumn: string | null;
  setTargetDialogColumn: (column: string | null) => void;
}

export default function SpreadsheetGrid({
  columnNames,
  columnTypes,
  rows,
  onUpdateCell,
  onToggleColumnType,
  onAddRow,
  onAddColumn,
  isDialogColumnTypeOpen,
  setIsDialogColumnTypeOpen,
  targetDialogColumn,
  setTargetDialogColumn,
}: SpreadsheetGridProps) {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [inputDialogChangeTypeValue, setInputDialogChangeTypeValue] =
    useState('');

  const handleCellClick = (rowIndex: number, columnName: string) => {
    setSelectedCell({ row: rowIndex, col: columnName });

    // If already selected and clicked again, enter edit mode
    if (selectedCell?.row === rowIndex && selectedCell?.col === columnName) {
      setEditingCell({ row: rowIndex, col: columnName });
    }
  };

  const handleCellDoubleClick = (rowIndex: number, columnName: string) => {
    setSelectedCell({ row: rowIndex, col: columnName });
    setEditingCell({ row: rowIndex, col: columnName });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleCellChange = (
    rowIndex: number,
    columnName: string,
    value: string
  ) => {
    onUpdateCell(rowIndex, columnName, value);
  };

  const handleClickChangeColumnType = (columnName: string) => {
    // if current type is ai-trigger, handle switch to regular type directly
    if (columnTypes[columnName] === 'ai-trigger') {
      onToggleColumnType(columnName, '_'); // prompt not relevant
      return;
    }

    // if current type is regular, open dialog to get prompt
    setInputDialogChangeTypeValue(
      'Evaluate if someone with a major in @Major is likely an engineer.'
    );
    setTargetDialogColumn(columnName);
    setIsDialogColumnTypeOpen(true);
    return;
  };

  const handleChangeColumnTypeSubmit = () => {
    // let page do the work (toggleColumnType). sent it the column and the prompt.
    if (targetDialogColumn) {
      onToggleColumnType(targetDialogColumn, inputDialogChangeTypeValue);
    } else {
      console.error('TODO: REMOVE THIS --targetDialogColumn is null');
    }
    setInputDialogChangeTypeValue('');
    setTargetDialogColumn(null);
    setIsDialogColumnTypeOpen(false);
  };

  return (
    <>
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {columnNames.map((column: string) => (
                  <th
                    key={`col-${column}`}
                    className="border-b p-2 text-left relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-700">
                        {column}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleClickChangeColumnType(column)}
                          >
                            {columnTypes[column] === 'regular'
                              ? 'Convert to AI-trigger'
                              : 'Convert to regular'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-0.5">
                      {columnTypes[column] === 'ai-trigger' && (
                        <div className="bg-purple-500 h-full w-full" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {columnNames.map((column: string) => (
                    <td
                      key={`cell-${rowIndex}-${column}`}
                      className="border p-0"
                    >
                      <Cell
                        value={row[column] || ''}
                        type={columnTypes[column]}
                        isSelected={
                          selectedCell?.row === rowIndex &&
                          selectedCell?.col === column
                        }
                        isEditing={
                          editingCell?.row === rowIndex &&
                          editingCell?.col === column
                        }
                        onClick={() => handleCellClick(rowIndex, column)}
                        onDoubleClick={() =>
                          handleCellDoubleClick(rowIndex, column)
                        }
                        onBlur={handleCellBlur}
                        onChange={(value) =>
                          handleCellChange(rowIndex, column, value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row and Column buttons */}
        <div className="flex justify-between p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddRow}
            className="text-gray-600 hover:text-gray-900"
          >
            + Row
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddColumn}
            className="text-gray-600 hover:text-gray-900"
          >
            + Column
          </Button>
        </div>
      </div>

      <Dialog
        open={isDialogColumnTypeOpen}
        onOpenChange={setIsDialogColumnTypeOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create AI-triggered column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p>
              All cells in the target column ({targetDialogColumn}) will be
              updated with the new AI-generated content.
            </p>
            <p>Prompt:</p>
            <div className="flex space-x-2">
              <Textarea
                value={inputDialogChangeTypeValue}
                placeholder="Enter prompt to generate content for all cells"
                onChange={(e) => setInputDialogChangeTypeValue(e.target.value)}
                disabled={true}
                className="min-h-[80px]"
              />
              <Button onClick={handleChangeColumnTypeSubmit}>
                Apply to All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
