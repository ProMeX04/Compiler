'use client';
import { ReactNode } from 'react';

export interface FileTab {
  id: string;
  name: string;
  content: string;
  language: string;
  active: boolean;
  isSynced: boolean;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  children: ReactNode;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
}

