import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FileTab } from '@/app/types/types';

interface CodeEditorDB extends DBSchema {
  files: {
    key: string;
    value: FileTab;
    indexes: { [key: string]: string };
  };
}

const DB_NAME = 'code-editor-db';
const DB_VERSION = 2; // Tăng phiên bản để cập nhật schema

export async function initDB(): Promise<IDBPDatabase<CodeEditorDB>> {
  return openDB<CodeEditorDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        const fileStore = transaction.objectStore('files');
        fileStore.createIndex('by-isSynced', 'isSynced');
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