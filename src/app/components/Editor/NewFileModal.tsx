import { LANGUAGE_CONFIGS } from "@/app/config/languageConfig";

interface NewFileModalProps {
  isOpen: boolean;
  theme: string;
  currentTheme: { bg: string };
  fileName: string;
  language: string;
  onFileNameChange: (name: string) => void;
  onLanguageChange: (lang: string) => void;
  onClose: () => void;
  onCreate: () => void;
  // Add any additional props needed for parameterization
}

export function NewFileModal({
  isOpen,
  theme,
  currentTheme,
  fileName,
  language,
  onFileNameChange,
  onLanguageChange,
  onClose,
  onCreate,
  // ...other props...
}: NewFileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`${currentTheme.bg} rounded-lg p-4 min-w-[300px]`}>
        <div className="mb-4">
          <label className="block text-xs mb-2 opacity-70">File Name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            className={`w-full p-2 text-sm rounded border ${
              theme === "light"
                ? "border-gray-300 bg-white"
                : "border-zinc-700 bg-zinc-800"
            }`}
            placeholder="Enter file name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreate();
              if (e.key === "Escape") onClose();
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs mb-2 opacity-70">Language:</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className={`w-full p-2 text-sm rounded border ${
              theme === "light"
                ? "border-gray-300 bg-white"
                : "border-zinc-700 bg-zinc-800"
            }`}
          >
            {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
              <option key={lang} value={lang}>
                {config.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className={`px-3 py-1.5 text-xs rounded ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-zinc-700"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}