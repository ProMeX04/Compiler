import React, { useState } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Example {
  input: string;
  output: string;
  explanation?: string;
};

export interface CreateExerciseFormProps {
  onSubmit: (exercise: any) => Promise<void>;
  onCancel: () => void;
}

export const CreateExerciseForm = ({ onSubmit, onCancel }: CreateExerciseFormProps) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    description: '',
    inputFormat: '',
    outputFormat: '',
    examples: [{ input: '', output: '', explanation: '' }] as Example[],
    parentId: '' // Optional parent exercise ID for creating sub-exercises
  });

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const TextArea = ({ label, value, onChange }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void 
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full p-2 rounded-md border min-h-[100px] ${
          theme === "light" 
            ? "border-gray-300 focus:border-blue-500" 
            : "border-zinc-700 bg-zinc-800 focus:border-blue-500"
        }`}
        required
      />
    </div>
  );

  return (
    <form 
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(formData);
      }} 
      className="p-4 space-y-4 max-w-3xl mx-auto"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className={`w-full p-2 rounded-md border ${
            theme === "light" 
              ? "border-gray-300 focus:border-blue-500" 
              : "border-zinc-700 bg-zinc-800 focus:border-blue-500"
          }`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Difficulty</label>
        <select
          value={formData.difficulty}
          onChange={e => setFormData(prev => ({ 
            ...prev, 
            difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'
          }))}
          className={`w-full p-2 rounded-md border ${
            theme === "light" 
              ? "border-gray-300" 
              : "border-zinc-700 bg-zinc-800"
          }`}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <TextArea
        label="Description"
        value={formData.description}
        onChange={val => setFormData(prev => ({ ...prev, description: val }))}
      />

      <TextArea
        label="Input Format"
        value={formData.inputFormat}
        onChange={val => setFormData(prev => ({ ...prev, inputFormat: val }))}
      />

      <TextArea
        label="Output Format"
        value={formData.outputFormat}
        onChange={val => setFormData(prev => ({ ...prev, outputFormat: val }))}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Examples</label>
          <button
            type="button"
            onClick={addExample}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            <FaPlus size={12} />
            Add Example
          </button>
        </div>

        {formData.examples.map((example, index) => (
          <div key={index} className={`p-4 rounded-md border ${
            theme === "light" ? "border-gray-200" : "border-zinc-700"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">Example {index + 1}</span>
              {formData.examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash size={12} />
                </button>
              )}
            </div>
            <TextArea
              label="Input"
              value={example.input}
              onChange={val => updateExample(index, 'input', val)}
            />
            <TextArea
              label="Output"
              value={example.output}
              onChange={val => updateExample(index, 'output', val)}
            />
            <TextArea
              label="Explanation"
              value={example.explanation || ''}
              onChange={val => updateExample(index, 'explanation', val)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-md ${
            theme === "light"
              ? "bg-gray-100 hover:bg-gray-200"
              : "bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Create Exercise
        </button>
      </div>
    </form>
  );
};