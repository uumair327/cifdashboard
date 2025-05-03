import React, { useState, useEffect } from 'react';
import { useCollectionData } from '../hooks/useCollectionData';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Quiz {
    id: string;
    name: string;
    thumbnail: string;
    use: boolean;
}

interface QuizQuestion {
    id: string;
    quiz: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    category: string;
    explanation: string;
}

const QuizManager: React.FC = () => {
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [isAddingQuiz, setIsAddingQuiz] = useState(false);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
    const [newQuiz, setNewQuiz] = useState({ name: '', thumbnail: '', use: true });
    const [newQuestion, setNewQuestion] = useState({
        quiz: '',
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        category: '',
        explanation: ''
    });
    const [error, setError] = useState<string | null>(null);

    const { data: oldQuizzes, loading: oldQuizzesLoading, error: oldQuizzesError, refetch: refetchOldQuizzes } = useCollectionData('quizes');
    const { data: newQuizzes, loading: newQuizzesLoading, error: newQuizzesError, refetch: refetchNewQuizzes } = useCollectionData('quiz');
    const { data: questions, loading: questionsLoading, error: questionsError, refetch: refetchQuestions } = useCollectionData('quiz_questions');

    // Combine old and new quizzes
    const quizzes = [...(oldQuizzes || []), ...(newQuizzes || [])];
    const quizzesLoading = oldQuizzesLoading || newQuizzesLoading;
    const quizzesError = oldQuizzesError || newQuizzesError;

    // Get the selected quiz name
    const selectedQuizName = selectedQuiz ? quizzes.find(q => q.id === selectedQuiz)?.name : null;

    // Filter questions based on the selected quiz name
    const filteredQuestions = selectedQuizName
        ? questions?.filter(q => q.quiz === selectedQuizName) || []
        : [];

    console.log('Selected Quiz:', selectedQuiz);
    console.log('Selected Quiz Name:', selectedQuizName);
    console.log('All Questions:', questions);
    console.log('Filtered Questions:', filteredQuestions);

    useEffect(() => {
        if (quizzesError || questionsError) {
            setError(quizzesError?.message || questionsError?.message || 'An error occurred');
        }
    }, [quizzesError, questionsError]);

    const handleAddQuiz = async () => {
        try {
            await addDoc(collection(db, 'quiz'), newQuiz);
            setNewQuiz({ name: '', thumbnail: '', use: true });
            setIsAddingQuiz(false);
            refetchNewQuizzes();
        } catch (error) {
            console.error('Error adding quiz:', error);
        }
    };

    const handleAddQuestion = async () => {
        try {
            if (!selectedQuizName) {
                setError('No quiz selected');
                return;
            }
            await addDoc(collection(db, 'quiz_questions'), {
                ...newQuestion,
                quiz: selectedQuizName
            });
            setNewQuestion({
                quiz: '',
                question: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                category: '',
                explanation: ''
            });
            setIsAddingQuestion(false);
            refetchQuestions();
        } catch (error) {
            console.error('Error adding question:', error);
            setError('Failed to add question');
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (window.confirm('Are you sure you want to delete this quiz? This will also delete all associated questions.')) {
            try {
                // Delete all questions associated with this quiz
                const quizQuestions = questions?.filter(q => q.quiz === quizzes.find(q => q.id === quizId)?.name) || [];
                await Promise.all(quizQuestions.map(q => deleteDoc(doc(db, 'quiz_questions', q.id))));

                // Delete the quiz from both collections
                try {
                    await deleteDoc(doc(db, 'quiz', quizId));
                } catch (e) {
                    console.log('Not found in quiz collection, trying quizes collection');
                }
                try {
                    await deleteDoc(doc(db, 'quizes', quizId));
                } catch (e) {
                    console.log('Not found in quizes collection');
                }

                refetchOldQuizzes();
                refetchNewQuizzes();
                refetchQuestions();
                if (selectedQuiz === quizId) {
                    setSelectedQuiz(null);
                }
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    };

    const handleToggleQuiz = async (quiz: Quiz) => {
        try {
            // Try to update in the new collection first
            try {
                await updateDoc(doc(db, 'quiz', quiz.id), {
                    use: !quiz.use
                });
            } catch (e) {
                // If not found in new collection, try the old one
                await updateDoc(doc(db, 'quizes', quiz.id), {
                    use: !quiz.use
                });
            }
            refetchOldQuizzes();
            refetchNewQuizzes();
        } catch (error) {
            console.error('Error toggling quiz:', error);
        }
    };

    const handleEditQuestion = (question: QuizQuestion) => {
        setEditingQuestion(question);
        setNewQuestion({
            quiz: question.quiz,
            question: question.question,
            options: [...question.options],
            correctOptionIndex: question.correctOptionIndex,
            category: question.category,
            explanation: question.explanation || ''
        });
    };

    const handleUpdateQuestion = async () => {
        if (!editingQuestion) return;

        try {
            await updateDoc(doc(db, 'quiz_questions', editingQuestion.id), {
                question: newQuestion.question,
                options: newQuestion.options,
                correctOptionIndex: newQuestion.correctOptionIndex,
                category: newQuestion.category,
                explanation: newQuestion.explanation
            });

            setEditingQuestion(null);
            setNewQuestion({
                quiz: '',
                question: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                category: '',
                explanation: ''
            });
            refetchQuestions();
        } catch (error) {
            console.error('Error updating question:', error);
            setError('Failed to update question');
        }
    };

    const handleCancelEdit = () => {
        setEditingQuestion(null);
        setNewQuestion({
            quiz: '',
            question: '',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            category: '',
            explanation: ''
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-red-500 text-white p-4 rounded-lg">
                    Error: {error}
                    <button
                        onClick={() => {
                            setError(null);
                            refetchOldQuizzes();
                            refetchNewQuizzes();
                            refetchQuestions();
                        }}
                        className="ml-4 px-2 py-1 bg-white text-red-500 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (quizzesLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quiz List Section */}
            <div className="bg-slate-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Quizzes</h2>
                    <button
                        onClick={() => setIsAddingQuiz(true)}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        <FiPlus />
                        Add Quiz
                    </button>
                </div>

                {isAddingQuiz && (
                    <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                        <h3 className="text-xl mb-4">Add New Quiz</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Quiz Name"
                                value={newQuiz.name}
                                onChange={(e) => setNewQuiz({ ...newQuiz, name: e.target.value })}
                                className="w-full p-2 rounded bg-slate-600"
                            />
                            <input
                                type="text"
                                placeholder="Thumbnail URL"
                                value={newQuiz.thumbnail}
                                onChange={(e) => setNewQuiz({ ...newQuiz, thumbnail: e.target.value })}
                                className="w-full p-2 rounded bg-slate-600"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddQuiz}
                                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                >
                                    <FiCheck />
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsAddingQuiz(false)}
                                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                >
                                    <FiX />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes?.map((quiz: Quiz) => (
                        <div
                            key={quiz.id}
                            className={`bg-slate-700 rounded-lg p-4 cursor-pointer transition-all ${selectedQuiz === quiz.id ? 'ring-2 ring-blue-500' : 'hover:bg-slate-600'
                                }`}
                            onClick={() => setSelectedQuiz(quiz.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold">{quiz.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleQuiz(quiz);
                                        }}
                                        className={`p-2 rounded ${quiz.use ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                    >
                                        {quiz.use ? <FiCheck /> : <FiX />}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuiz(quiz.id);
                                        }}
                                        className="p-2 rounded bg-red-500 hover:bg-red-600"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                            {quiz.thumbnail && (
                                <img
                                    src={quiz.thumbnail}
                                    alt={quiz.name}
                                    className="w-full h-32 object-cover rounded mb-2"
                                />
                            )}
                            <div className="text-sm text-slate-400">
                                {filteredQuestions.length} questions
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Questions Section */}
            {selectedQuiz && (
                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">
                            Questions for {quizzes.find(q => q.id === selectedQuiz)?.name}
                        </h2>
                        <button
                            onClick={() => setIsAddingQuestion(true)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            <FiPlus />
                            Add Question
                        </button>
                    </div>

                    {(isAddingQuestion || editingQuestion) && (
                        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                            <h3 className="text-xl mb-4">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Question"
                                    value={newQuestion.question}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                    className="w-full p-2 rounded bg-slate-600"
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={newQuestion.category}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                    className="w-full p-2 rounded bg-slate-600"
                                />
                                <textarea
                                    placeholder="Explanation (optional)"
                                    value={newQuestion.explanation}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                    className="w-full p-2 rounded bg-slate-600"
                                />
                                <div className="space-y-2">
                                    {newQuestion.options.map((option, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="radio"
                                                checked={newQuestion.correctOptionIndex === index}
                                                onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: index })}
                                                className="mt-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${index + 1}`}
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...newQuestion.options];
                                                    newOptions[index] = e.target.value;
                                                    setNewQuestion({ ...newQuestion, options: newOptions });
                                                }}
                                                className="flex-1 p-2 rounded bg-slate-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                    >
                                        <FiCheck />
                                        {editingQuestion ? 'Update' : 'Save'}
                                    </button>
                                    <button
                                        onClick={editingQuestion ? handleCancelEdit : () => setIsAddingQuestion(false)}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                                    >
                                        <FiX />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {filteredQuestions.map((question: QuizQuestion) => (
                            <div key={question.id} className="bg-slate-700 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{question.question}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditQuestion(question)}
                                            className="p-2 rounded bg-blue-500 hover:bg-blue-600"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this question?')) {
                                                    deleteDoc(doc(db, 'quiz_questions', question.id));
                                                    refetchQuestions();
                                                }
                                            }}
                                            className="p-2 rounded bg-red-500 hover:bg-red-600"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-400 mb-2">Category: {question.category}</div>
                                {question.explanation && (
                                    <div className="text-sm text-slate-400 mb-2">Explanation: {question.explanation}</div>
                                )}
                                <div className="space-y-2">
                                    {question.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 rounded ${index === question.correctOptionIndex
                                                ? 'bg-green-500/20 border border-green-500'
                                                : 'bg-slate-600'
                                                }`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizManager; 