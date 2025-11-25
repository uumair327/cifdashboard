/**
 * Quiz Manager Page - Enhanced Version
 * Manages quizzes and questions with improved UI/UX
 */
import { useState, useMemo, useCallback } from 'react';
import { createRepository } from '../../collections/data';
import { useCollection } from '../../collections/hooks/useCollection';
import { useCollectionMutations } from '../../collections/hooks/useCollectionMutations';
import { Quiz, QuizQuestion } from '../../collections/domain/entities/Quiz';
import { useToast } from '../../../core/components/Toast/ToastProvider';
import { QuizCard } from '../components/QuizCard';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionForm } from '../components/QuestionForm';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';

export default function QuizManagerPage() {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<Partial<QuizQuestion>>({
    question: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    category: '',
    explanation: '',
  });

  const { addToast } = useToast();

  // Repositories
  const quizRepository = useMemo(() => createRepository<Quiz>('quiz'), []);
  const quizesRepository = useMemo(() => createRepository<Quiz>('quizes'), []);
  const questionsRepository = useMemo(() => createRepository<QuizQuestion>('quiz_questions'), []);

  // Fetch data
  const { data: newQuizzes, loading: newQuizzesLoading, refetch: refetchNewQuizzes } = useCollection(quizRepository, 'quiz');
  const { data: oldQuizzes, loading: oldQuizzesLoading, refetch: refetchOldQuizzes } = useCollection(quizesRepository, 'quizes');
  const { data: questions, loading: questionsLoading, refetch: refetchQuestions } = useCollection(questionsRepository, 'quiz_questions');

  // Mutations
  const { deleteItem: deleteQuiz, update: updateQuiz } = useCollectionMutations(quizRepository, {
    collectionName: 'quiz',
    onSuccess: () => refetchNewQuizzes(),
  });

  const { deleteItem: deleteOldQuiz, update: updateOldQuiz } = useCollectionMutations(quizesRepository, {
    collectionName: 'quizes',
    onSuccess: () => refetchOldQuizzes(),
  });

  const { create: createQuestion, update: updateQuestion, deleteItem: deleteQuestion } = useCollectionMutations(questionsRepository, {
    collectionName: 'quiz_questions',
    onSuccess: () => {
      refetchQuestions();
      setEditingQuestion(null);
      setIsAddingQuestion(false);
      resetQuestionForm();
    },
  });

  // Combine quizzes
  const allQuizzes = useMemo(() => {
    return [...(newQuizzes || []), ...(oldQuizzes || [])];
  }, [newQuizzes, oldQuizzes]);

  const loading = newQuizzesLoading || oldQuizzesLoading || questionsLoading;

  // Get selected quiz
  const selectedQuiz = useMemo(() => {
    return allQuizzes.find(q => q.id === selectedQuizId);
  }, [allQuizzes, selectedQuizId]);

  // Filter questions for selected quiz
  const filteredQuestions = useMemo(() => {
    if (!selectedQuiz || !questions) return [];
    return questions.filter(q => q.quiz === selectedQuiz.name);
  }, [selectedQuiz, questions]);

  const resetQuestionForm = useCallback(() => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      category: '',
      explanation: '',
    });
  }, []);

  const handleEditQuestion = useCallback((question: QuizQuestion) => {
    setEditingQuestion(question);
    setIsAddingQuestion(false);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctOptionIndex: question.correctOptionIndex,
      category: question.category,
      explanation: question.explanation || '',
    });
  }, []);

  const handleAddQuestion = useCallback(() => {
    setIsAddingQuestion(true);
    setEditingQuestion(null);
    resetQuestionForm();
  }, [resetQuestionForm]);

  const handleSaveQuestion = useCallback(async () => {
    if (!selectedQuiz) return;

    const questionData = {
      ...questionForm,
      quiz: selectedQuiz.name,
    };

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, questionData);
        addToast('success', 'Question updated successfully');
      } else {
        await createQuestion(questionData as Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>);
        addToast('success', 'Question created successfully');
      }
    } catch (error) {
      addToast('error', 'Failed to save question');
    }
  }, [selectedQuiz, questionForm, editingQuestion, updateQuestion, createQuestion, addToast]);

  const handleDeleteQuiz = useCallback(async (quiz: Quiz) => {
    if (!window.confirm(`Delete "${quiz.name}"? This will also delete all ${filteredQuestions.length} questions.`)) return;

    try {
      // Delete all questions first
      const quizQuestions = questions?.filter(q => q.quiz === quiz.name) || [];
      for (const question of quizQuestions) {
        await deleteQuestion(question.id);
      }

      // Try deleting from both collections
      try {
        await deleteQuiz(quiz.id);
      } catch {
        await deleteOldQuiz(quiz.id);
      }

      addToast('success', 'Quiz deleted successfully');
      if (selectedQuizId === quiz.id) {
        setSelectedQuizId(null);
      }
    } catch (error) {
      addToast('error', 'Failed to delete quiz');
    }
  }, [questions, deleteQuestion, deleteQuiz, deleteOldQuiz, addToast, selectedQuizId, filteredQuestions.length]);

  const handleToggleQuizUse = useCallback(async (quiz: Quiz) => {
    try {
      const updateData = { use: !quiz.use };
      try {
        await updateQuiz(quiz.id, updateData);
      } catch {
        await updateOldQuiz(quiz.id, updateData);
      }
      addToast('success', `Quiz ${!quiz.use ? 'activated' : 'deactivated'}`);
    } catch (error) {
      addToast('error', 'Failed to update quiz');
    }
  }, [updateQuiz, updateOldQuiz, addToast]);

  const handleDeleteQuestion = useCallback(async (question: QuizQuestion) => {
    if (!window.confirm('Delete this question?')) return;
    
    try {
      await deleteQuestion(question.id);
      addToast('success', 'Question deleted successfully');
    } catch (error) {
      addToast('error', 'Failed to delete question');
    }
  }, [deleteQuestion, addToast]);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestion(null);
    setIsAddingQuestion(false);
    resetQuestionForm();
  }, [resetQuestionForm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Quizzes Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select a quiz to manage its questions
            </p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {allQuizzes.length} {allQuizzes.length === 1 ? 'quiz' : 'quizzes'}
          </div>
        </div>

        {allQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No quizzes found</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                isSelected={selectedQuizId === quiz.id}
                questionCount={questions?.filter(q => q.quiz === quiz.name).length || 0}
                onSelect={() => setSelectedQuizId(quiz.id)}
                onDelete={() => handleDeleteQuiz(quiz)}
                onToggleUse={() => handleToggleQuizUse(quiz)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Questions Section */}
      {selectedQuiz && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Questions for "{selectedQuiz.name}"
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}
              </p>
            </div>
            {!editingQuestion && !isAddingQuestion && (
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <FiPlus />
                Add Question
              </button>
            )}
          </div>

          {/* Question Form */}
          {(editingQuestion || isAddingQuestion) && (
            <div className="mb-6">
              <QuestionForm
                question={questionForm}
                isEditing={!!editingQuestion}
                onSave={handleSaveQuestion}
                onCancel={handleCancelEdit}
                onChange={(field, value) => setQuestionForm(prev => ({ ...prev, [field]: value }))}
              />
            </div>
          )}

          {/* Questions List */}
          {!editingQuestion && !isAddingQuestion && (
            <>
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-700 rounded-lg">
                  <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No questions yet</p>
                  <button
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiPlus />
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() => handleEditQuestion(question)}
                      onDelete={() => handleDeleteQuestion(question)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
