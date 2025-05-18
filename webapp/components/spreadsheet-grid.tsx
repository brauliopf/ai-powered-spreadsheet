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
import ChangeColumnTypeModal from './change-colunm-type-modal';

interface SpreadsheetGridProps {
  columns: Record<string, 'regular' | 'ai-trigger'>;
  rows: Record<string, string>[];
  onUpdateCell: (rowIndex: number, columnName: string, value: string) => void;
  onToggleColumnType: (columnName: string, prompt: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
}

export default function SpreadsheetGrid({
  columns,
  rows,
  onUpdateCell,
  onToggleColumnType,
  onAddRow,
  onAddColumn,
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
  const [targetColumn, setTargetColumn] = useState<string | null>(null);

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

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {Object.keys(columns).map((column: string) => (
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
                        {/* behave as its child */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ChangeColumnTypeModal
                          targetColumn={column}
                          onSubmit={onToggleColumnType}
                        >
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                            }}
                          >
                            {columns[column] === 'regular'
                              ? 'Convert to AI-trigger'
                              : 'Convert to regular'}
                          </DropdownMenuItem>
                        </ChangeColumnTypeModal>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5">
                    {columns[column] === 'ai-trigger' && (
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
                {Object.keys(columns).map((column: string) => (
                  <td key={`cell-${rowIndex}-${column}`} className="border p-0">
                    <Cell
                      value={row[column] || ''}
                      type={columns[column]}
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
  );
}
