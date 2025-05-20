import { useState } from 'react';

interface UseCellHandlersProps {
  onUpdateCell: (rowIndex: number, columnName: string, value: string) => void;
  onTriggerAIFunction: (rowIndex: number, columnName: string) => void;
}

export function useCellHandlers({
  onUpdateCell,
  onTriggerAIFunction,
}: UseCellHandlersProps) {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);

  const handleCellClick = (rowIndex: number, columnName: string) => {
    console.log('handleCellClick');
    setSelectedCell({ row: rowIndex, col: columnName });
    if (selectedCell?.row === rowIndex && selectedCell?.col === columnName) {
      setEditingCell({ row: rowIndex, col: columnName });
    }
  };

  const handleCellDoubleClick = (rowIndex: number, columnName: string) => {
    console.log('handleCellDoubleClick');
    setSelectedCell({ row: rowIndex, col: columnName });
    setEditingCell({ row: rowIndex, col: columnName });
  };

  const handleCellBlur = () => {
    console.log('handleCellBlur');
    setEditingCell(null);
  };

  const handleCellChange = (
    rowIndex: number,
    columnName: string,
    value: string
  ) => {
    console.log('handleCellChange');
    onUpdateCell(rowIndex, columnName, value);
  };

  const handleTriggerAIFunction = (rowIndex: number, columnName: string) => {
    onTriggerAIFunction(rowIndex, columnName);
  };

  return {
    selectedCell,
    editingCell,
    handleCellClick,
    handleCellDoubleClick,
    handleCellBlur,
    handleCellChange,
    handleTriggerAIFunction,
  };
}
