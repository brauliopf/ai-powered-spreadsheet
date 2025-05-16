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

interface SpreadsheetGridProps {
  columnNames: string[];
  rows: Record<string, any>[];
  columnTypes: Record<string, 'regular' | 'ai-trigger'>;
  onUpdateCell: (rowIndex: number, columnName: string, value: string) => void;
  onToggleColumnType: (columnName: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  isDialogColumnTypeOpen: boolean;
  setIsDialogColumnTypeOpen: (isOpen: boolean) => void;
  targetColumn: string | null;
  setTargetColumn: (column: string | null) => void;
}

export default function SpreadsheetGrid({
  columnNames,
  rows,
  columnTypes,
  onUpdateCell,
  onToggleColumnType,
  onAddRow,
  onAddColumn,
  isDialogColumnTypeOpen,
  setIsDialogColumnTypeOpen,
  targetColumn,
  setTargetColumn,
}: SpreadsheetGridProps) {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');

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

  const openColumnDialog = (columnName: string) => {
    setTargetColumn(columnName);
    setIsDialogColumnTypeOpen(true);
  };

  const handleDialogSubmit = () => {
    if (targetColumn && inputValue) {
      // Update all cells in the column (example implementation)
      rows.forEach((_, rowIndex) => {
        onUpdateCell(rowIndex, targetColumn, inputValue);
      });
      setInputValue('');
      setIsDialogColumnTypeOpen(false);
    }
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
                            onClick={() => onToggleColumnType(column)}
                          >
                            {columnTypes[column] === 'regular'
                              ? 'Convert to AI-trigger'
                              : 'Convert to regular'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openColumnDialog(column)}
                          >
                            Edit Column Data
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
            <DialogTitle>Column Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p>Edit all cells in column: {targetColumn || ''}</p>
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value for all cells"
              />
              <Button onClick={handleDialogSubmit}>Apply to All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
