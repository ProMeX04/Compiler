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

export interface FileExplorerProps {
  files: FileTab[];
  activeFile: string | null;
  onSelectFile: (id: string) => void;
  onContextMenu: (event: React.MouseEvent, id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onAddFile: () => void;
  isSyncing: boolean;
  syncWithCloud: () => void;
  pullFromCloud: () => void;
  onUploadFile: (file: File) => void;
  searchTerm?: string;
  onSearch: (term: string) => void;
}