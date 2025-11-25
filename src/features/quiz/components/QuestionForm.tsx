/**
 * Question Form Component
 * Form for creating/editing questions
 */
import { QuizQuestion } from '../../collections/domain/entities/Quiz';
import { FiCheck, FiX } from 'react-icons/fi';

interface QuestionFormProps {
  question: Partial<QuizQuestion>;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof QuizQuestion, value: any) => void;
}

export function QuestionForm({ question, isEditing, onSave, onCancel, onChange }: QuestionFormProps) {
  const isValid = question.question && question.category && question.options?.every(o => o.trim());

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-6 shadow-lg">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            title="Close"
          >
            <FiX size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={question.question || ''}
            onChange={(e) => onChange('question', e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-600 text-gray-900 dark:text-white border-2 border-slate-200 dark:border-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            rows={3}
            placeholder="Enter your question here..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-600 text-gray-900 dark:text-white border-2 border-slate-200 dark:border-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="e.g., Cyberbullying, Online Safety"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Answer Options <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
              (Click the radio button to mark the correct answer)
            </span>
          </label>
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div
                key={index}
                className={`
                  flex gap-3 items-center p-4 rounded-lg transition-all
                  ${question.correctOptionIndex === index
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-600 border-2 border-slate-200 dark:border-slate-500 hover:border-slate-300 dark:hover:border-slate-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name="correctOption"
                  checked={question.correctOptionIndex === index}
                  onChange={() => onChange('correctOptionIndex', index)}
                  className="w-5 h-5 cursor-pointer text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    onChange('options', newOptions);
                  }}
                  className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-slate-300 dark:border-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={`Option ${index + 1}`}
                />
                {question.correctOptionIndex === index && (
                  <span className="flex-shrink-0 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                    ✓ Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Explanation (Optional)
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
              Help users understand why this is the correct answer
            </span>
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => onChange('explanation', e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-600 text-gray-900 dark:text-white border-2 border-slate-200 dark:border-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            rows={3}
            placeholder="Provide an explanation for the correct answer..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
          <button
            onClick={onSave}
            disabled={!isValid}
            className={`
              flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
              ${isValid
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <FiCheck size={20} />
            {isEditing ? 'Save Changes' : 'Add Question'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
