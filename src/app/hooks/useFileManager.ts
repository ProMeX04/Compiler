import { useState, useEffect } from 'react';
import { FileTab as FileTabType } from '@/app/types/types';
import { LANGUAGE_CONFIGS, getLanguageExtension } from '@/app/config/languageConfig';
import { useFirebaseAuth } from './useFirebaseAuth';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore'; // Added import
import { db } from '../firebaseConfig'; // Added import
import { saveFileToIDB, getAllFilesFromIDB, deleteFileFromIDB } from '@/app/utils/idb';

interface UseFileManagerProps {
  defaultContent?: string;
  defaultFileName?: string;
  defaultLanguage?: string;
  templateCodes?: { [key: string]: string };
}

export function useFileManager({
  templateCodes = {},
}: UseFileManagerProps) {
  const { user } = useFirebaseAuth();
  const [tabs, setTabs] = useState<FileTabType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null); // <--- Added state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Remove the user-dependent loading effect and only load from IndexedDB
  useEffect(() => {
    const loadFiles = async () => {
      const files = await getAllFilesFromIDB();
      if (files.length > 0) {
        setTabs(files);
        setActiveTab(files[0].id);
      }
    };
    loadFiles();
  }, []); // Only runs once on mount

  const updateTabContent = async (id: string, newContent: string) => {
    const updatedTabs = tabs.map((tab) =>
      tab.id === id ? { ...tab, content: newContent } : tab
    );
    setTabs(updatedTabs);
    
    const updatedFile = updatedTabs.find(tab => tab.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  };

  const updateTabName = async (id: string, newName: string) => {
    const updatedTabs = tabs.map((tab) => {
      if (tab.id === id) {
        const nameWithoutExt = newName.split(".")[0];
        const extension = getLanguageExtension(tab.language);
        return { ...tab, name: `${nameWithoutExt}.${extension}` };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    const updatedFile = updatedTabs.find(tab => tab.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  };

  const removeTab = async (id: string) => {
    // Thay vì xóa, cập nhật active = false
    const updatedTabs = tabs.map(tab => 
      tab.id === id ? { ...tab, active: false } : tab
    );
    setTabs(updatedTabs);
    
    // Cập nhật trong IndexedDB
    const updatedFile = updatedTabs.find(tab => tab.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }

    // Chuyển sang tab khác nếu đang active
    if (activeTab === id) {
      const nextActiveTab = tabs.find(tab => tab.id !== id && tab.active);
      setActiveTab(nextActiveTab?.id || "");
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    if (!LANGUAGE_CONFIGS[newLanguage]) return;

    const updatedTabs = tabs.map((tab) => {
      if (tab.id === activeTab) {
        const nameWithoutExt = tab.name.split(".")[0];
        const extension = getLanguageExtension(newLanguage);
        const shouldUseTemplate = !tab.content || tab.content.trim() === "";
        
        const templateCode = shouldUseTemplate
          ? templateCodes[newLanguage] || LANGUAGE_CONFIGS[newLanguage]?.defaultContent || ""
          : tab.content;

        return {
          ...tab,
          language: newLanguage,
          name: `${nameWithoutExt}.${extension}`,
          content: templateCode,
        };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    const updatedFile = updatedTabs.find(tab => tab.id === activeTab);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  };

  const addFile = async () => {
    const newFile = {
      id: String(Date.now()),
      name: 'New File',
      content: '',
      language: 'javascript',
      active: true // Add active status
    };
    await saveFileToIDB(newFile);
    setTabs(prev => [...prev, newFile]);
    setActiveTab(newFile.id);
  };

  const updateFile = async (fileId: string, updatedData: Partial<FileTabType>) => {
    if (user) {
      const fileRef = doc(db, 'userCodes', user.uid, 'files', fileId);
      await setDoc(fileRef, updatedData, { merge: true }); 
      setTabs(prevTabs => prevTabs.map(file => file.id === fileId ? { ...file, ...updatedData } : file));
    }
  };

  const deleteFile = async (fileId: string) => {
    if (user) {
      const fileRef = doc(db, 'userCodes', user.uid, 'files', fileId);
      await deleteDoc(fileRef);
      setTabs(prevTabs => prevTabs.filter(file => file.id !== fileId));
    }
  };

  const syncWithFirebase = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      for (const file of tabs) {
        const fileRef = doc(db, 'userCodes', user.uid, 'files', file.id);
        await setDoc(fileRef, {
          name: file.name,
          content: file.content,
          language: file.language
        });
      }
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncWithCloud = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const localFiles = await getAllFilesFromIDB();
      
      // Xử lý từng file dựa trên trạng thái active
      for (const file of localFiles) {
        const fileRef = doc(db, 'userCodes', user.uid, 'files', file.id);
        
        if (file.active) {
          // Cập nhật nếu file còn active
          await setDoc(fileRef, {
            name: file.name,
            content: file.content,
            language: file.language,
            active: true
          });
        } else {
          // Xóa nếu file không còn active
          await deleteDoc(fileRef);
          // Xóa khỏi IndexedDB sau khi đã xóa thành công trên Firebase
          await deleteFileFromIDB(file.id);
        }
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error syncing with Cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullFromCloud = async () => {
    if (!user || isSyncing) {
      console.log('Please login to pull from cloud');
      return;
    }

    setIsSyncing(true);
    try {
      const filesCollection = collection(db, 'userCodes', user.uid, 'files');
      const querySnapshot = await getDocs(filesCollection);
      const cloudFiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Clear existing files from IndexedDB
      const existingFiles = await getAllFilesFromIDB();
      for (const file of existingFiles) {
        await deleteFileFromIDB(file.id);
      }

      // Save new files to IndexedDB
      for (const file of cloudFiles) {
        await saveFileToIDB(file as FileTabType);
      }

      // Update UI
      setTabs(cloudFiles as FileTabType[]);
      if (cloudFiles.length > 0) {
        setActiveTab(cloudFiles[0].id);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error pulling from Cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const activeFile = tabs.find((tab) => tab.id === activeTab);

  return {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    activeFile,
    renamingTabId, // Ensure this is now defined
    setRenamingTabId, // Ensure this is now defined
    updateTabContent,
    updateTabName,
    removeTab,
    handleLanguageChange,
    addFile,
    updateFile,
    deleteFile,
    isSyncing,
    syncWithFirebase,
    lastSyncTime,
    syncWithCloud,
    pullFromCloud,
  };
}