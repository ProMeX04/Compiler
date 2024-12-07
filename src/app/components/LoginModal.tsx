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
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.7)',
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
          backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
          color: theme === 'light' ? '#1f2937' : '#e5e7eb',
          borderRadius: '8px',
          padding: '0',
          overflow: 'hidden',
          margin: '0 auto',
          border: theme === 'light' 
            ? '1px solid rgba(0,0,0,0.1)' 
            : '1px solid rgba(255,255,255,0.1)',
          boxShadow: theme === 'light'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)'
        },
      }}
    >
      {error && (
        <div className={`p-2 text-xs text-center ${
          theme === 'light'
            ? 'bg-red-50 text-red-700'  
            : 'bg-red-900/30 text-red-400'
        }`}>
          {error}
        </div>
      )}
      {user ? (
        <div className={`p-4 flex items-center ${
          theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e]'
        }`}>
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
            <p className={`font-medium ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            } truncate`}>
              {user.displayName}
            </p>
            <p className={`text-xs mt-1 mb-4 truncate ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {user.email}
            </p>
            <button
              onClick={logout}
              className={`w-full text-sm py-2 px-4 rounded-md transition-colors ${
                theme === 'light'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <h3 className={`text-base font-semibold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'  // Changed text color to darker
            }`}>
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
                  <h4 className={`text-sm font-medium ${
                    theme === 'light' ? 'text-blue-800' : 'text-blue-300'  // Adjusted text color
                  }`}>
                    Cloud Sync
                  </h4>
                  <p className={`text-xs ${
                    theme === 'light' ? 'text-blue-700' : 'text-blue-400/80'  // Adjusted text color
                  }`}>
                    Tự động lưu và đồng bộ code
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    theme === 'light' ? 'text-green-800' : 'text-green-300'  // Adjusted text color
                  }`}>
                    Multi-device
                  </h4>
                  <p className={`text-xs ${
                    theme === 'light' ? 'text-green-700' : 'text-green-400/80'  // Adjusted text color
                  }`}>
                    Truy cập từ mọi thiết bị
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    theme === 'light' ? 'text-purple-800' : 'text-purple-300'  // Adjusted text color
                  }`}>
                    Collaboration
                  </h4>
                  <p className={`text-xs ${
                    theme === 'light' ? 'text-purple-700' : 'text-purple-400/80'  // Adjusted text color
                  }`}>
                    Chia sẻ và làm việc nhóm
                  </p>
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
                ? 'text-gray-800 group-hover:text-gray-900'  // Changed text color to darker shade
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