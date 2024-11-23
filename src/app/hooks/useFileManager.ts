import { useState } from 'react';
import { FileTab as FileTabType } from '@/app/types/types';
import { LANGUAGE_CONFIGS, getLanguageExtension } from '@/app/config/languageConfig';

interface UseFileManagerProps {
  defaultContent?: string;
  defaultFileName?: string;
  defaultLanguage?: string;
  templateCodes?: { [key: string]: string };
}

export function useFileManager({
  defaultContent = "",
  defaultFileName = "main",
  defaultLanguage = "python",
  templateCodes = {},
}: UseFileManagerProps) {
  const [tabs, setTabs] = useState<FileTabType[]>([
    {
      id: "1",
      name: `${defaultFileName}.${getLanguageExtension(defaultLanguage)}`,
      content: defaultContent || templateCodes[defaultLanguage] || LANGUAGE_CONFIGS[defaultLanguage]?.defaultContent || "",
      language: defaultLanguage,
    },
  ]);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);

  const updateTabContent = (id: string, newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, content: newContent } : tab))
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

  const activeFile = tabs.find((tab) => tab.id === activeTab);

  return {
    tabs,
    setTabs,
    activeTab,
    setActiveTab,
    activeFile,
    renamingTabId,
    setRenamingTabId,
    updateTabContent,
    updateTabName,
    removeTab,
    handleLanguageChange,
  };
}