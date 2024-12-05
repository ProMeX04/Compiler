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
        className="absolute bg-white dark:bg-zinc-800 rounded-lg shadow-2xl overflow-hidden w-[320px]"
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
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-white">
                Đăng nhập để trải nghiệm thêm
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Cloud Sync</h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Tự động lưu và đồng bộ code</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Multi-device</h4>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">Truy cập từ mọi thiết bị</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">Collaboration</h4>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80">Chia sẻ và làm việc nhóm</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-700/50 border dark:border-zinc-600 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors group"
            >
              <FcGoogle size={20} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                Tiếp tục với Google
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}