import { useState } from 'react';
import { getLanguageExtension } from '@/app/config/languageConfig';
import { LANGUAGE_CONFIGS } from '@/app/config/languageConfig';

interface UseNewFileModalProps {
  defaultLanguage: string;
  templateCodes: { [key: string]: string };
  onFileCreated: (file: { id: string; name: string; content: string; language: string }) => void;
}

export function useNewFileModal({ defaultLanguage, templateCodes, onFileCreated }: UseNewFileModalProps) {
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("Main");
  const [newFileLanguage, setNewFileLanguage] = useState(defaultLanguage);

  const openNewFileModal = () => {
    setNewFileName("Main");
    setNewFileLanguage(defaultLanguage);
    setIsNewFileModalOpen(true);
  };

  const handleCreateNewFile = () => {
    const newId = String(Date.now());
    const extension = getLanguageExtension(newFileLanguage);
    // Ưu tiên lấy code từ templateCodes, nếu không có thì lấy từ LANGUAGE_CONFIGS
    const templateCode = templateCodes[newFileLanguage] || 
                       LANGUAGE_CONFIGS[newFileLanguage]?.defaultContent || '';

    onFileCreated({
      id: newId,
      name: `${newFileName}.${extension}`,
      content: templateCode,
      language: newFileLanguage,
    });

    setIsNewFileModalOpen(false);
  };

  return {
    isNewFileModalOpen,
    newFileName,
    newFileLanguage,
    setNewFileName,
    setNewFileLanguage,
    openNewFileModal,
    handleCreateNewFile,
    setIsNewFileModalOpen,
  };
}