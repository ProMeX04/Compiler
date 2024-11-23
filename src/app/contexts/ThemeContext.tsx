'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  light: {
    name: 'vs',
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    borderColor: 'border-gray-200',
    tabBg: 'bg-white',
    tabActiveBg: 'bg-white',
    tabHoverBg: 'bg-gray-50',
    containerBg: 'bg-gray-100',
    panelBg: 'bg-white',
  },
  dark: {
    name: 'vs-dark',
    bg: 'bg-zinc-900',
    text: 'text-white',  // Thay đổi từ text-zinc-100 thành text-white
    borderColor: 'border-zinc-700',
    tabBg: 'bg-zinc-800',
    tabActiveBg: 'bg-zinc-900',
    tabHoverBg: 'bg-zinc-700',
    containerBg: 'bg-zinc-800',
    panelBg: 'bg-zinc-900',
  },
};

const ThemeContext = createContext({
  theme: 'dark',
  currentTheme: themes.dark,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme: themes[theme === 'dark' ? 'dark' : 'light'],
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);