import { useState } from 'react';

export function useColumnHeaderHandlers(
  onRenameColumn: (oldName: string, newName: string) => void
) {
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleColumnDoubleClick = (column: string) => {
    setEditingColumn(column);
    setEditingValue(column);
  };

  const handleColumnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const finishEditing = () => {
    if (
      editingColumn &&
      editingValue.trim() !== '' &&
      editingValue !== editingColumn
    ) {
      onRenameColumn(editingColumn, editingValue.trim());
    }
    setEditingColumn(null);
    setEditingValue('');
  };

  const cancelEditing = () => {
    setEditingColumn(null);
    setEditingValue('');
  };

  const handleColumnInputBlur = () => {
    finishEditing();
  };

  const handleColumnInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return {
    editingColumn,
    editingValue,
    handleColumnDoubleClick,
    handleColumnInputChange,
    handleColumnInputBlur,
    handleColumnInputKeyDown,
  };
}
