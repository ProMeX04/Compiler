
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FileTab } from '@/app/types/types';

interface CodeEditorDB extends DBSchema {
  files: {
    key: string;
    value: FileTab;
  };
}

const DB_NAME = 'code-editor-db';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<CodeEditorDB>> {
  return openDB<CodeEditorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    },
  });
}

export async function saveFileToIDB(file: FileTab): Promise<void> {
  const db = await initDB();
  await db.put('files', file);
}

export async function getAllFilesFromIDB(): Promise<FileTab[]> {
  const db = await initDB();
  return db.getAll('files');
}

export async function deleteFileFromIDB(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('files', id);
}