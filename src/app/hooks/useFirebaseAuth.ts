import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User } from 'firebase/auth';
import { app, db } from '../firebaseConfig';
import { doc, getDoc} from 'firebase/firestore';

const auth = getAuth(app);

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch {
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch shared file without authentication
  const fetchSharedFile = async (shareCode: string) => {
    try {
      const [userId, fileId] = atob(shareCode).split('/');
      if (!userId || !fileId) return null;

      const fileRef = doc(db, "userCodes", userId, "files", fileId);
      const fileDoc = await getDoc(fileRef);
      
      if (!fileDoc.exists()) {
        console.log("File not found");
        return null;
      }

      const fileData = fileDoc.data();
      if (!fileData.isShared && user?.uid !== userId) {
        console.log("File is not shared");
        return null;
      }

      return { 
        id: fileId,
        ...fileData,
        isShared: true,
        readOnly: user?.uid !== userId
      };
    } catch (error) {
      console.error("Error fetching shared file:", error);
      return null;
    }
  };

  return { user, signInWithGoogle, logout, loading, fetchSharedFile };
}