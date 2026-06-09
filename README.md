# 💻 Online Code Editor

A web-based code editor and execution environment inspired by VS Code. Write, edit, and run code in 50+ programming languages directly in the browser.

## ✨ Features

- **Monaco Editor** — VS Code-grade code editing with syntax highlighting, IntelliSense, and theme support (One Dark)
- **Multi-Language Execution** — Run code in 50+ languages (Python, C++, Java, JavaScript, Go, Rust, etc.) via the Piston API
- **File Explorer** — Create, rename, delete, and organize files and folders with a tree-view sidebar
- **Cloud Sync** — Save and load projects from Firebase Firestore with user authentication
- **Context Menus** — Right-click context menus for file operations
- **Resizable Panels** — Drag-to-resize editor, file explorer, and output panels
- **Responsive UI** — Clean, modern interface with Tailwind CSS and Framer Motion animations

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Monaco Editor** | Code editor (VS Code engine) |
| **Piston API** | Remote code execution engine |
| **Firebase** | Authentication & Firestore (cloud storage) |
| **Zustand** | Lightweight state management |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | UI animations |
| **React Query** | Server state management |

## 📁 Project Structure

```
src/app/
├── components/
│   ├── CodeEditor.tsx       # Monaco editor wrapper
│   ├── EditorHeader.tsx     # Toolbar (run, language select, save)
│   ├── FileExplorer.tsx     # File tree sidebar
│   ├── LoginModal.tsx       # Firebase auth modal
│   └── Editor/              # Editor sub-components
├── config/                  # Language configurations
├── contexts/                # React context providers
├── hooks/                   # Custom React hooks
├── providers/               # App-level providers
├── services/
│   └── piston.ts            # Piston API client (execute & runtimes)
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── layout.tsx               # Root layout
└── page.tsx                 # Main page
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (for auth & cloud sync)

### Installation

```bash
# Clone the repository
git clone https://github.com/ProMeX04/Compiler.git
cd Compiler

# Install dependencies
npm install

# Configure Firebase
# Edit src/app/firebaseConfig.ts with your Firebase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start coding.

## 📄 License

This project is for educational purposes.
