'use client';
import { FcGoogle } from 'react-icons/fc';
import { useFirebaseAuth } from '@/app/hooks/useFirebaseAuth';
import React, { useState } from 'react';
import Image from 'next/image';
import Modal from 'react-modal';
import { useTheme } from "@/app/contexts/ThemeContext"; // Add this line to import useTheme

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; left: number }; // Make position optional
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { user, signInWithGoogle, logout } = useFirebaseAuth();
  const { theme } = useTheme(); // Add this line to get current theme
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setError('Failed to sign in');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          position: 'relative',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          width: '320px',
          backgroundColor: theme === 'light' ? 'white' : '#1e1e1e',
          borderRadius: '8px',
          padding: '0',
          overflow: 'hidden',
          margin: '0 auto',
          border: theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)'
        },
      }}
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
            <p className="font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
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
            className={`w-full flex items-center justify-center gap-3 p-3 rounded-lg transition-colors group ${
              theme === 'light'
                ? 'bg-white hover:bg-gray-50 border border-gray-200'
                : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <FcGoogle size={20} />
            <span className={`text-sm font-medium ${
              theme === 'light'
                ? 'text-gray-700 group-hover:text-gray-900'
                : 'text-gray-200 group-hover:text-white'
            }`}>
              Tiếp tục với Google
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
}