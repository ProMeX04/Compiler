import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User } from 'firebase/auth';
import { app, db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const auth = getAuth(app);

interface Exercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  subExercises?: Exercise[];
  completed?: boolean;
}

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

  // Function to fetch exercises from Firebase
  const fetchExercises = async (): Promise<Exercise[]> => {
    try {
      const exercisesCollection = collection(db, "exercises");
      const querySnapshot = await getDocs(exercisesCollection);
      const exercises = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];
      return exercises;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return [];
    }
  };

  // Add new function to create exercise
  const createExercise = async (exercise: Omit<Exercise, 'id' | 'completed'>): Promise<string | null> => {
    try {
      if (!user) return null;
      
      const exercisesCollection = collection(db, "exercises");
      const docRef = await addDoc(exercisesCollection, {
        ...exercise,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating exercise:", error);
      return null;
    }
  };

  return { 
    user, signInWithGoogle, logout, loading, fetchSharedFile, fetchExercises, createExercise 
  };
}