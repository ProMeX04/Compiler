import { useState } from 'react';
import { FileTab as FileTabType } from '@/app/types/types';
import { LANGUAGE_CONFIGS, getLanguageExtension } from '@/app/config/languageConfig';
import { useFirebaseAuth } from './useFirebaseAuth';
import { collection, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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

  const updateTabContent = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, content: newContent } : tab
      )
    );
  };

  const updateTabName = (id: string, newName: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === id) {
          const nameWithoutExt = newName.split(".")[0];
          const extension = getLanguageExtension(tab.language);
          return { ...tab, name: `${nameWithoutExt}.${extension}` };
        }
        return tab;
      })
    );
  };

  const removeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs[0]?.id || "");
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (!LANGUAGE_CONFIGS[newLanguage]) return;

    setTabs((prev) =>
      prev.map((tab) => {
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
      })
    );
  };

  const addFile = async () => {
    if (user) {
      const filesCollection = collection(db, 'userCodes', user.uid, 'files');
      const newFile = {
        name: 'New File',
        content: '',
        language: 'javascript'
      };
      const docRef = await addDoc(filesCollection, newFile);
      const createdFile: FileTabType = { id: docRef.id, ...newFile };
      setTabs(prev => [...prev, createdFile]);
      setActiveTab(docRef.id); 
    }
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
  };
}