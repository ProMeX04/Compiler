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

      let left = position.left + 50;
      if (left + modalWidth > viewportWidth) {
        left = position.left - modalWidth - 10; // Dịch sang trái nếu không đủ không gian
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
      setError('Failed to sign in');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50" 
      onClick={onClose}
    >
      <div
        className="absolute bg-white dark:bg-zinc-800 rounded-lg shadow-2xl overflow-hidden w-64"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
          pointerEvents: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-2 text-red-600 dark:text-red-400 text-xs text-center">
            {error}
          </div>
        )}
        
        {user ? (
          <div className="p-4 flex items-center">
            <div className="relative w-16 h-16 mr-4">
              {user.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt="Profile" 
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 truncate">
                {user.email}
              </p>
              <button
                onClick={logout}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-700 border dark:border-zinc-600 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors"
            >
              <FcGoogle size={18} />
              <span className="text-sm">Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}