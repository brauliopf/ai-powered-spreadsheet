'use client';

import { useState, useEffect } from 'react';
import { Cell } from '@/components/cell';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, X, Edit } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ChangeColumnTypeModal from './change-colunm-type-modal';
import { useCellHandlers } from '@/hooks/use-cell-handlers';
import { useColumnHeaderHandlers } from '@/hooks/use-column-header-handlers';

type ColumnConfig = {
  type: 'regular' | 'ai-trigger';
  prompt?: string;
};

interface SpreadsheetGridProps {
  columns: Record<string, ColumnConfig>; // a single object with as many {string, ColumnConfig} pairs (columns).
  rows: Record<string, string>[]; // an array of objects with as many string-valued (key, value) pairs (columns).
  onGetRowId: (row: Record<string, string>, idx: number) => string;
  onUpdateCell: (rowIndex: number, columnName: string, value: string) => void;
  onToggleColumnType: (columnName: string, prompt: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onTriggerAIFunction: (rowIndex: number, columnName: string) => void;
  onRenameColumn: (oldName: string, newName: string) => void;
  onDeleteColumn: (columnName: string) => void;
  onSwitchColumnType: (columnName: string) => void;
  onEditColumnPrompt: (columnName: string, newPrompt: string) => void;
}

export default function SpreadsheetGrid({
  columns,
  rows,
  onGetRowId,
  onUpdateCell,
  onToggleColumnType,
  onAddRow,
  onAddColumn,
  onTriggerAIFunction,
  onRenameColumn,
  onDeleteColumn,
  onSwitchColumnType,
  onEditColumnPrompt,
}: SpreadsheetGridProps) {
  // Remove local state and handlers for cell interactions
  const {
    selectedCell,
    editingCell,
    handleCellClick,
    handleCellDoubleClick,
    handleCellBlur,
    handleCellChange,
    handleTriggerAIFunction,
  } = useCellHandlers({
    onUpdateCell,
    onTriggerAIFunction,
  });

  const {
    editingColumn,
    editingValue,
    handleColumnDoubleClick,
    handleColumnInputChange,
    handleColumnInputBlur,
    handleColumnInputKeyDown,
  } = useColumnHeaderHandlers(onRenameColumn);

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {/* TABLE HEADER */}
            <tr className="bg-gray-50">
              {Object.keys(columns).map((column: string) => (
                <th
                  key={`col-${column}`}
                  className="border-b-4 border-l-2 border-r-2 border-t-1 p-2 text-left relative"
                >
                  <div
                    className="flex items-center justify-between"
                    onDoubleClick={() => handleColumnDoubleClick(column)}
                  >
                    <span className="font-medium text-sm text-gray-700">
                      {editingColumn === column ? (
                        <input
                          className="font-medium text-sm text-gray-700 bg-white border rounded px-1 py-0.5 w-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={editingValue}
                          onChange={handleColumnInputChange}
                          onBlur={handleColumnInputBlur}
                          onKeyDown={handleColumnInputKeyDown}
                        />
                      ) : (
                        column
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* DELETE COLUMN */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <X
                              className="h-3.5 w-3.5 cursor-pointer hover:text-red-500"
                              onClick={() => onDeleteColumn(column)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Delete column</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {columns[column].type === 'regular' ? (
                        // REGULAR COLUMN - CONVERT TO AI-TRIGGER
                        <ChangeColumnTypeModal
                          targetColumn={column}
                          onSubmit={onToggleColumnType}
                        >
                          <div className="h-6 w-6 p-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {columns[column].type === 'regular'
                                      ? 'Convert to AI-trigger'
                                      : 'Convert to regular'}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </ChangeColumnTypeModal>
                      ) : (
                        // AI-TRIGGER COLUMN - EDIT PROMPT OR CONVERT TO REGULAR
                        <>
                          {/* EDIT AI-TRIGGER COLUMN PROMPT */}
                          <ChangeColumnTypeModal
                            targetColumn={column}
                            onSubmit={(targetColumn, newPrompt) => {
                              console.log(
                                '>>> newPrompt:',
                                targetColumn,
                                newPrompt
                              );
                              onEditColumnPrompt(targetColumn, newPrompt);
                            }}
                            initialPrompt={columns[column].prompt}
                          >
                            <div className="h-6 w-6 p-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Edit className="h-3.5 w-3.5" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Edit AI prompt</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </ChangeColumnTypeModal>
                          {/* CONVERT TO REGULAR */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ArrowRightLeft
                                  className="h-3.5 w-3.5"
                                  onClick={() => onSwitchColumnType(column)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Convert to regular</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5">
                    {columns[column].type === 'ai-trigger' && (
                      <div className="bg-purple-500 h-full w-full" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {/* TABLE BODY */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={onGetRowId(row, rowIndex)}>
                {Object.keys(columns).map((column: string) => (
                  <td key={`cell-${rowIndex}-${column}`} className="border p-0">
                    <Cell
                      value={row[column] || ''}
                      type={columns[column].type}
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
                      onTriggerAIFunction={() =>
                        handleTriggerAIFunction(rowIndex, column)
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
