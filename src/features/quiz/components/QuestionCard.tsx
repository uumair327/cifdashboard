/**
 * Question Card Component
 * Displays a single question with options
 */
import { QuizQuestion } from '../../collections/domain/entities/Quiz';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionCard({ question, index, onEdit, onDelete }: QuestionCardProps) {
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
              {index + 1}
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {question.category}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {question.question}
          </h3>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            title="Edit question"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Delete question"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-200 italic">
            💡 {question.explanation}
          </p>
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className={`
              p-3 rounded-lg flex items-center gap-3 transition-colors
              ${optionIndex === question.correctOptionIndex
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600'
                : 'bg-slate-50 dark:bg-slate-600 border-2 border-transparent'
              }
            `}
          >
            {optionIndex === question.correctOptionIndex && (
              <span className="flex-shrink-0 text-green-600 dark:text-green-400 font-bold text-lg">
                ✓
              </span>
            )}
            <span className={`
              flex-1 text-sm
              ${optionIndex === question.correctOptionIndex
                ? 'text-green-900 dark:text-green-100 font-medium'
                : 'text-gray-700 dark:text-gray-300'
              }
            `}>
              {option}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
