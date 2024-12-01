import { useState, useEffect } from "react";
import { FileTab as FileTabType } from "@/app/types/types";
import {
  LANGUAGE_CONFIGS,
  getLanguageExtension,
} from "@/app/config/languagesConfig/categories";
import { useFirebaseAuth } from "./useFirebaseAuth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  saveFileToIDB,
  getAllFilesFromIDB,
  deleteFileFromIDB,
} from "@/app/utils/idb";

interface UseFileManagerProps {
  defaultContent?: string;
  defaultFileName?: string;
  defaultLanguage?: string;
  templateCodes?: { [key: string]: string };
}

export function useFileManager({ templateCodes = {} }: UseFileManagerProps) {
  const { user } = useFirebaseAuth();
  const [files, setFiles] = useState<FileTabType[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      const files = await getAllFilesFromIDB();
      if (files.length > 0) {
        setFiles(files);
      }
    };
    loadFiles();
  }, []);

  const updateAndSaveFile = async (updatedFiles: FileTabType[]) => {
    setFiles(updatedFiles as typeof files); // Add type casting if needed
    const updatedFile = updatedFiles.find((file) => file.id === activeFileId);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  };
  const updateFileContent = async (id: string, newContent: string) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, content: newContent, isSynced: false } : file
    );
    await updateAndSaveFile(updatedFiles);
  };

  const updateFileName = async (id: string, newName: string) => {
    const updatedFiles = files.map((file) => {
      if (file.id === id) {
        const nameWithoutExt = newName.split(".")[0];
        const extension = getLanguageExtension(file.language);
        return {
          ...file,
          name: `${nameWithoutExt}.${extension}`,
          isSynced: false,
        };
      }
      return file;
    });

    await updateAndSaveFile(updatedFiles);
  };

  const removeFile = async (id: string) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, active: false } : file
    );
    await updateAndSaveFile(updatedFiles);
    if (activeFileId === id) {
      const nextActiveFile = files.find(
        (file) => file.id !== id && file.active
      );
      setActiveFileId(nextActiveFile?.id || "");
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    if (!LANGUAGE_CONFIGS[newLanguage]) return;

    const updatedFiles = files.map((file) => {
      if (file.id === activeFileId) {
        const nameWithoutExt = file.name.split(".")[0];
        const extension = getLanguageExtension(newLanguage);
        const shouldUseTemplate = !file.content || file.content.trim() === "";

        const templateCode = shouldUseTemplate
          ? templateCodes[newLanguage] ||
            LANGUAGE_CONFIGS[newLanguage]?.defaultContent ||
            ""
          : file.content;

        return {
          ...file,
          language: newLanguage,
          name: `${nameWithoutExt}.${extension}`,
          content: templateCode,
        };
      }
      return file;
    });

    setFiles(updatedFiles);
    const updatedFile = updatedFiles.find((file) => file.id === activeFileId);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }
  };

  const addFile = async () => {
    const currentLanguage = activeFileId
      ? files.find((file) => file.id === activeFileId)?.language
      : "cpp";
    const defaultLanguage = currentLanguage || "cpp";
    const defaultContent =
      LANGUAGE_CONFIGS[defaultLanguage]?.defaultContent || "";
    const extension = getLanguageExtension(defaultLanguage);

    const newFile = {
      id: String(Date.now()),
      name: `untitled.${extension}`,
      content: defaultContent,
      language: defaultLanguage,
      active: true,
      isSynced: false,
    };

    await saveFileToIDB(newFile);
    setFiles((prev) => [...prev, newFile]);
  };

  const updateFile = async (
    fileId: string,
    updatedData: Partial<FileTabType>
  ) => {
    if (user) {
      const fileRef = doc(db, "userCodes", user.uid, "files", fileId);
      await setDoc(fileRef, updatedData, { merge: true });
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, ...updatedData } : file
        )
      );
    }
  };
  const deleteFile = async (fileId: string) => {
    if (user) {
      const fileRef = doc(db, "userCodes", user.uid, "files", fileId);
      await deleteDoc(fileRef);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    }
  };
  const syncWithFirebase = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      for (const file of files) {
        const fileRef = doc(db, "userCodes", user.uid, "files", file.id);
        await setDoc(fileRef, {
          name: file.name,
          content: file.content,
          language: file.language,
        });
      }
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncWithCloud = async () => {
    if (!user || isSyncing || !activeFileId) return; // Thêm check activeFileId

    setIsSyncing(true);
    try {
      const activeFile = files.find(file => file.id === activeFileId);
      if (!activeFile) return;

      const fileRef = doc(db, "userCodes", user.uid, "files", activeFile.id);
      await setDoc(fileRef, {
        name: activeFile.name,
        content: activeFile.content,
        language: activeFile.language,
        active: true,
      });

      // Cập nhật trạng thái isSynced chỉ cho file hiện tại
      const updatedFiles = files.map((f) =>
        f.id === activeFileId ? { ...f, isSynced: true } : f
      );
      setFiles(updatedFiles);
      await saveFileToIDB({ ...activeFile, isSynced: true });

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Error syncing with Cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullFromCloud = async () => {
    if (!user || isSyncing) {
      console.log("Please login to pull from cloud");
      return;
    }

    setIsSyncing(true);
    try {
      const filesCollection = collection(db, "userCodes", user.uid, "files");
      const querySnapshot = await getDocs(filesCollection);
      const cloudFiles = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isSynced: true,
      }));

      const existingFiles = await getAllFilesFromIDB();
      for (const file of existingFiles) {
        await deleteFileFromIDB(file.id);
      }

      for (const file of cloudFiles) {
        await saveFileToIDB(file as FileTabType);
      }

      setFiles(cloudFiles as FileTabType[]);
      if (cloudFiles.length > 0) {
        setActiveFileId(cloudFiles[0].id);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Error pulling from Cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const uploadFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const extension = file.name.split(".").pop() || "txt";
      const language = getLanguageFromExtension(extension);
      const newFile: FileTabType = {
        id: String(Date.now()),
        name: file.name,
        content,
        language,
        active: true,
        isSynced: false,
      };
      await saveFileToIDB(newFile);
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
  };

  const getLanguageFromExtension = (extension: string): string => {
    const mapping: { [key: string]: string } = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      cpp: "cpp",
      java: "java",
      cs: "csharp",
    };
    return mapping[extension.toLowerCase()] || "plaintext";
  };

  const activeFile = files.find((file) => file.id === activeFileId);

  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile,
    renamingFileId,
    setRenamingFileId,
    updateFileContent,
    updateFileName,
    removeFile,
    handleLanguageChange,
    addFile,
    updateFile,
    deleteFile,
    isSyncing,
    syncWithFirebase,
    lastSyncTime,
    syncWithCloud,
    pullFromCloud,
    uploadFile,
  };
}
