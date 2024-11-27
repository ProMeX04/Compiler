'use client';
import { FcGoogle } from 'react-icons/fc';
import { useFirebaseAuth } from '@/app/hooks/useFirebaseAuth';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

export function LoginModal({ isOpen, onClose, position }: LoginModalProps) {
  const { user, signInWithGoogle, logout } = useFirebaseAuth();
  const [error, setError] = useState('');
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen) {
      const modalWidth = 280; 
      const modalHeight = 180;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = position.left;
      if (left + modalWidth > viewportWidth) {
        left = Math.max(0, viewportWidth - modalWidth);
      }

      let top = position.top;
      if (top + modalHeight > viewportHeight) {
        top = Math.max(0, position.top - modalHeight);
      }

      setAdjustedPosition({ top, left });
    }
  }, [isOpen, position]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setError('Google sign in failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0" style={{ pointerEvents: 'none' }}>
      <div
        className="absolute bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-xl w-72 z-50" // Adjusted width and padding
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
          pointerEvents: 'auto'
        }}
      >
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        
        {user ? (
          <div className="flex flex-col items-center">
            {user.photoURL && (
              <Image src={user.photoURL} alt="User Avatar" width={48} height={48} className="rounded-full mb-3" />
                      )
            }
            <p className="text-md dark:text-white">{user.displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <button
              onClick={logout}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-3" 
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 p-2 mb-3 border rounded hover:bg-gray-50 dark:hover:bg-zinc-700 dark:border-zinc-600" 
          >
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-2 text-center text-gray-500 hover:text-gray-600 dark:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}