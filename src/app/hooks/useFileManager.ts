import { useState, useEffect } from "react";
import { FileTab as FileTabType } from "@/app/types/types";
import {
  LANGUAGE_CONFIGS,
  getLanguageExtension,
} from "@/app/config/languagesConfig/categories";
import { useFirebaseAuth } from "./useFirebaseAuth";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  saveFileToIDB,
  getAllFilesFromIDB,
  deleteFileFromIDB
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
          isSynced: false, // Add this
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
      isShared: false,
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
      await setDoc(fileRef, { ...updatedData, isSynced: false }, { merge: true }); // Add isSynced
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.id === fileId ? { ...file, ...updatedData, isSynced: false } : file // Add isSynced
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

  const syncFileWithCloud = async (fileId: string) => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      const fileToSync = files.find(file => file.id === fileId);
      if (!fileToSync) return;

      const fileRef = doc(db, "userCodes", user.uid, "files", fileId);
      await setDoc(fileRef, {
        name: fileToSync.name,
        content: fileToSync.content,
        language: fileToSync.language,
        active: true,
      });

      const updatedFiles = files.map((f) =>
        f.id === fileId ? { ...f, isSynced: true } : f
      );
      setFiles(updatedFiles);
      await saveFileToIDB({ ...fileToSync, isSynced: true });

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Error syncing file with Cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullFileFromCloud = async (fileId: string) => {
    if (!user || isSyncing) {
      console.log("Please login to pull from cloud");
      return;
    }

    setIsSyncing(true);
    try {
      const fileRef = doc(db, "userCodes", user.uid, "files", fileId);
      const fileDoc = await getDoc(fileRef);
      if (fileDoc.exists()) {
        const cloudFile = { id: fileDoc.id, ...fileDoc.data(), isSynced: true };
        await saveFileToIDB(cloudFile as FileTabType);
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId ? { ...file, ...cloudFile } : file
          )
        );
      } else {
        console.log("No such file in cloud");
      }
    } catch (error) {
      console.error("Error pulling file from Cloud:", error);
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
    if (!user || isSyncing || !activeFileId) {
      console.log("Please login to pull from cloud");
      return;
    }

    setIsSyncing(true);
    try {
      const fileRef = doc(db, "userCodes", user.uid, "files", activeFileId);
      const fileDoc = await getDoc(fileRef);
      if (fileDoc.exists()) {
        const cloudFile = { id: fileDoc.id, ...fileDoc.data(), isSynced: true };
        await saveFileToIDB(cloudFile as FileTabType);
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === activeFileId ? { ...file, ...cloudFile } : file
          )
        );
        setLastSyncTime(new Date());
      } else {
        console.log("No such file in cloud");
      }
    } catch (error) {
      console.error("Error pulling from Cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveAllFiles = async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      const activeFiles = files.filter(file => file.active);
      const inactiveFiles = files.filter(file => !file.active);

      // Delete inactive files from Cloud
      for (const file of inactiveFiles) {
        const fileRef = doc(db, "userCodes", user.uid, "files", file.id);
        await deleteDoc(fileRef);
        // Delete from IndexedDB
        await deleteFileFromIDB(file.id); // You'll need to create this function in your IDB utils
      }

      // Save active files to Cloud
      for (const file of activeFiles) {
        const fileRef = doc(db, "userCodes", user.uid, "files", file.id);
        await setDoc(fileRef, {
          name: file.name,
          content: file.content,
          language: file.language,
          active: true,
        });
      }

      // Update files state to remove inactive files
      const updatedFiles = activeFiles.map(file => ({
        ...file,
        isSynced: true
      }));
      setFiles(updatedFiles);
      
      // Save active files to IndexedDB
      for (const file of updatedFiles) {
        await saveFileToIDB(file);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Error saving all files to Cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullAllFromCloud = async () => {
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

      for (const file of cloudFiles) {
        await saveFileToIDB(file as FileTabType);
      }

      setFiles(cloudFiles as FileTabType[]);
      if (cloudFiles.length > 0) {
        setActiveFileId(cloudFiles[0].id);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Error pulling all files from Cloud:", error);
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
        isShared: false
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

  const handleRenameFile = async (id: string, newName: string) => {
    const updatedFiles = files.map((file) => {
      if (file.id === id) {
        const nameWithoutExt = newName.split(".")[0];
        const extension = getLanguageExtension(file.language);
        return { 
          ...file, 
          name: `${nameWithoutExt}.${extension}`,
          isSynced: false
        };
      }
      return file;
    });

    setFiles(updatedFiles);
    const updatedFile = updatedFiles.find((file) => file.id === id);
    if (updatedFile) {
      await saveFileToIDB(updatedFile);
    }

    setRenamingFileId(null);
  };

  const shareFile = async (fileId: string): Promise<string> => {
    try {
      if (!user) throw new Error("User must be logged in to share files");

      const fileToShare = files.find(f => f.id === fileId);
      if (!fileToShare) throw new Error("File not found");

      // Update file in userCodes with isShared flag
      const fileRef = doc(db, "userCodes", user.uid, "files", fileId);
      await setDoc(fileRef, {
        ...fileToShare,
        isShared: true
      }, { merge: true });

      // Update local state
      const updatedFiles = files.map(f => 
        f.id === fileId ? { ...f, isShared: true } : f
      );
      setFiles(updatedFiles);

      // Generate share link with userId/fileId
      const shareCode = btoa(`${user.uid}/${fileId}`);
      return `${window.location.origin}?shareCode=${shareCode}`;
    } catch (error) {
      console.error("Error sharing file:", error);
      throw error;
    }
  };

  // Function to handle accessing shared file
  const accessSharedFile = async (shareCode: string) => {
    try {
      // Decode userId and fileId from shareCode
      const [userId, fileId] = atob(shareCode).split('/');
      if (!userId || !fileId) {
        console.log("Invalid share code");
        return false;
      }

      // Access file directly from userCodes collection
      const fileRef = doc(db, "userCodes", userId, "files", fileId);
      const fileDoc = await getDoc(fileRef);
      
      if (!fileDoc.exists() || !fileDoc.data().isShared) {
        console.log("File not found or not shared");
        return false;
      }

      const fileData = { 
        id: fileId, 
        ...fileDoc.data() 
      } as FileTabType;

      // Only add to state if not already present
      if (!files.some(f => f.id === fileId)) {
        const sharedFile = {
          ...fileData,
          isShared: true,
          readOnly: user?.uid !== userId,
          active: true
        };
        setFiles(prev => [...prev, sharedFile]);
      }
      setActiveFileId(fileId);
      return true;

    } catch (error) {
      console.error("Error accessing shared file:", error);
      return false;
    }
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
    saveAllFiles,
    pullAllFromCloud,
    syncFileWithCloud,
    pullFileFromCloud,
    handleRenameFile,
    shareFile,
    accessSharedFile,
  };
}
