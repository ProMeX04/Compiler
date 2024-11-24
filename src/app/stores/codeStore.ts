
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FileTab, TestCase } from '../types/types'

interface CodeStore {
  tabs: FileTab[]
  activeTab: string
  testCases: TestCase[]
  setTabs: (tabs: FileTab[]) => void
  setActiveTab: (id: string) => void
  updateTabContent: (id: string, content: string) => void
  addTab: (tab: FileTab) => void
  removeTab: (id: string) => void
  setTestCases: (testCases: TestCase[]) => void
}

export const useCodeStore = create<CodeStore>()(
  persist(
    (set) => ({
      tabs: [],
      activeTab: '',
      testCases: [{ input: '', expectedOutput: '' }],
      setTabs: (tabs) => set({ tabs }),
      setActiveTab: (activeTab) => set({ activeTab }),
      updateTabContent: (id, content) => set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === id ? { ...tab, content } : tab
        ),
      })),
      addTab: (tab) => set((state) => ({
        tabs: [...state.tabs, tab],
        activeTab: tab.id,
      })),
      removeTab: (id) => set((state) => ({
        tabs: state.tabs.filter((tab) => tab.id !== id),
        activeTab: state.activeTab === id ? state.tabs[0]?.id || '' : state.activeTab,
      })),
      setTestCases: (testCases) => set({ testCases }),
    }),
    {
      name: 'code-store',
    }
  )
)