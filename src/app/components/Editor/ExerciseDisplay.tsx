import React, { useEffect, useState } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { FaChevronRight, FaCheckCircle, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useFirebaseAuth } from "@/app/hooks/useFirebaseAuth";
import { CreateExerciseForm } from './CreateExerciseForm';

interface Exercise {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  subExercises?: Exercise[];
  completed?: boolean;
}

const DifficultyBadge = ({ difficulty }: { difficulty: Exercise['difficulty'] }) => {
  const colors = {
    Easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

export const ExerciseDisplay = () => {
  const { theme } = useTheme();
  const { user, fetchExercises: fetchExercisesFromFirebase, createExercise } = useFirebaseAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showList, setShowList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        if (!user) {
          console.log('Please login to view exercises');
          return;
        }
        const fetchedExercises = await fetchExercisesFromFirebase();
        if (Array.isArray(fetchedExercises)) {
          setExercises(fetchedExercises);
          if (fetchedExercises.length > 0) {
            setSelectedExercise(fetchedExercises[0]);
          }
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };
    loadExercises();
  }, [user, fetchExercisesFromFirebase]);

  const handleBackClick = () => {
    if (isCreating) {
      setIsCreating(false);
    } else if (!showList) {
      setShowList(true);
    }
  };

  const renderExerciseTree = (exercise: Exercise, depth = 0) => (
    <div key={exercise.id} className={`ml-${depth * 4}`}>
      <button
        onClick={() => {
          setSelectedExercise(exercise);
          setShowList(false);
        }}
        className={`w-full px-3 py-2 my-1 text-left rounded-md flex items-center justify-between ${
          theme === "light"
            ? "hover:bg-gray-50 border border-gray-200"
            : "hover:bg-zinc-800 border border-zinc-700"
        }`}
      >
        <span className="flex items-center gap-2">
          {exercise.completed && (
            <FaCheckCircle className="text-green-500" size={12} />
          )}
          {exercise.title}
        </span>
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={exercise.difficulty} />
          {exercise.subExercises && (
            <FaChevronRight size={12} className="opacity-50" />
          )}
        </div>
      </button>
      {exercise.subExercises && (
        <div className="ml-4 border-l-2 border-dashed border-opacity-20">
          {exercise.subExercises.map(sub => renderExerciseTree(sub, depth + 1))}
        </div>
      )}
    </div>
  );

  const renderExerciseContent = (exercise: Exercise) => {
    if (!exercise) return null;
    
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${
            theme === "light" ? "text-gray-800" : "text-gray-200"
          }`}>
            {exercise.title || 'Untitled Exercise'}
          </h2>
          <DifficultyBadge difficulty={exercise.difficulty} />
        </div>

        <div className={`prose max-w-none ${
          theme === "light" ? "prose-gray" : "prose-invert"
        }`}>
          {exercise.description && (
            <section>
              <h3>Description</h3>
              <p>{exercise.description}</p>
            </section>
          )}

          {exercise.inputFormat && (
            <section>
              <h3>Input Format</h3>
              <p>{exercise.inputFormat}</p>
            </section>
          )}

          {exercise.outputFormat && (
            <section>
              <h3>Output Format</h3>
              <p>{exercise.outputFormat}</p>
            </section>
          )}

          {exercise.examples?.length > 0 && (
            <section>
              <h3>Examples</h3>
              {exercise.examples.map((example, index) => (
                <div key={index} className={`mt-4 p-4 rounded-md ${
                  theme === "light" ? "bg-gray-50" : "bg-zinc-800"
                }`}>
                  <div className="mb-2">
                    <strong>Input:</strong>
                    <pre className="mt-1">{example.input}</pre>
                  </div>
                  <div className="mb-2">
                    <strong>Output:</strong>
                    <pre className="mt-1">{example.output}</pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <strong>Explanation:</strong>
                      <p className="mt-1">{example.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full overflow-y-auto ${
      theme === "light" 
        ? "bg-white border-l border-gray-200" 
        : "bg-[#1e1e1e] border-l border-zinc-800"
    }`}>
      {/* Header with back button and create button */}
      <div className={`sticky top-0 p-3 border-b z-10 flex items-center justify-between ${
        theme === "light" ? "bg-white border-gray-200" : "bg-[#1e1e1e] border-zinc-800"
      }`}>
        <div className="flex items-center">
          <button
            onClick={handleBackClick}
            className={`p-2 rounded-md mr-2 ${
              theme === "light" ? "hover:bg-gray-100" : "hover:bg-zinc-800"
            }`}
          >
            <FaArrowLeft size={14} />
          </button>
          <h2 className="font-medium">
            {isCreating ? "Create Exercise" : showList ? "Exercise List" : selectedExercise?.title}
          </h2>
        </div>
        {showList && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            <FaPlus size={12} />
            Create Exercise
          </button>
        )}
      </div>

      {/* Exercise List, Create Form, or Exercise Content */}
      {isCreating ? (
        <div className="relative">
          <CreateExerciseForm 
            onSubmit={async (exercise) => {
              const id = await createExercise(exercise);
              if (id) {
                setIsCreating(false);
                const updatedExercises = await fetchExercisesFromFirebase();
                setExercises(updatedExercises);
                setShowList(true); // Show list after creation
              }
            }}
            onCancel={() => {
              setIsCreating(false);
              setShowList(true);
            }}
          />
        </div>
      ) : showList ? (
        <div className="p-4">
          {exercises.map(exercise => renderExerciseTree(exercise))}
        </div>
      ) : selectedExercise ? (
        renderExerciseContent(selectedExercise)
      ) : (
        <div className="p-4 text-center text-gray-500">
          Select an exercise to view details
        </div>
      )}
    </div>
  );
};

export default ExerciseDisplay;
