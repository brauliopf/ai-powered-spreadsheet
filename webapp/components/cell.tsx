'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface CellProps {
  value: string;
  type: 'regular' | 'ai-trigger';
  isSelected: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onTriggerAIFunction: () => void;
}

export function Cell({
  value,
  type,
  isSelected,
  isEditing,
  onClick,
  onDoubleClick,
  onBlur,
  onChange,
  onTriggerAIFunction,
}: CellProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    onChange(inputValue);
    onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      onBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value); // Reset to original value
      onBlur();
    }
  };

  const cellContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-2 outline-none border-none"
        />
      );
    }

    if (type === 'ai-trigger') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`w-full h-full p-2 flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <span>{value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerAIFunction();
                  }}
                  disabled={isLoading}
                >
                  <Wand2
                    className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-64 p-3">
              <div className="space-y-2">
                <p className="font-medium text-sm">AI-Triggered Cell</p>
                <p className="text-xs text-gray-500">
                  {reasoning ||
                    'Click the wand icon to analyze this data with AI.'}
                </p>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerAIFunction();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze with AI'}
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className={`w-full h-full p-2 ${isSelected ? 'bg-blue-50' : ''}`}>
        {value}
      </div>
    );
  };

  return (
    <div
      className={`min-h-[40px] min-w-[100px] ${isSelected ? 'outline outline-2 outline-blue-500 z-10 relative' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={() => {}}
      aria-live="polite"
    >
      {cellContent()}
    </div>
  );
}
