/**
 * Quiz Card Component
 * Displays a single quiz with actions
 */
import { Quiz } from '../../collections/domain/entities/Quiz';
import { FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

interface QuizCardProps {
  quiz: Quiz;
  isSelected: boolean;
  questionCount: number;
  onSelect: () => void;
  onDelete: () => void;
  onToggleUse?: () => void;
}

export function QuizCard({ quiz, isSelected, questionCount, onSelect, onDelete, onToggleUse }: QuizCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        group relative bg-white dark:bg-slate-700 rounded-lg p-4 cursor-pointer 
        transition-all duration-200 hover:shadow-lg
        ${isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600'
        }
      `}
    >
      {/* Quiz Image */}
      {quiz.thumbnail && (
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-600">
          <img
            src={quiz.thumbnail}
            alt={quiz.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      )}

      {/* Quiz Info */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {quiz.name}
        </h3>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
          </span>
          
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${quiz.use 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
            }
          `}>
            {quiz.use ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onToggleUse && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleUse();
            }}
            className={`
              p-2 rounded-lg transition-colors
              ${quiz.use
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-slate-400 hover:bg-slate-500 text-white'
              }
            `}
            title={quiz.use ? 'Deactivate quiz' : 'Activate quiz'}
          >
            {quiz.use ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Delete quiz"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}
