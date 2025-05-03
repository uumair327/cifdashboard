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
}

const QuizManager: React.FC = () => {
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [isAddingQuiz, setIsAddingQuiz] = useState(false);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [newQuiz, setNewQuiz] = useState({ name: '', thumbnail: '', use: true });
    const [newQuestion, setNewQuestion] = useState({
        quiz: '',
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        category: ''
    });

    const { data: quizzes, loading: quizzesLoading, refetch: refetchQuizzes } = useCollectionData('quizes');
    const { data: questions, loading: questionsLoading, refetch: refetchQuestions } = useCollectionData('quiz_questions');

    const filteredQuestions = questions?.filter(q => q.quiz === selectedQuiz) || [];

    const handleAddQuiz = async () => {
        try {
            await addDoc(collection(db, 'quizes'), newQuiz);
            setNewQuiz({ name: '', thumbnail: '', use: true });
            setIsAddingQuiz(false);
            refetchQuizzes();
        } catch (error) {
            console.error('Error adding quiz:', error);
        }
    };

    const handleAddQuestion = async () => {
        try {
            await addDoc(collection(db, 'quiz_questions'), {
                ...newQuestion,
                quiz: selectedQuiz
            });
            setNewQuestion({
                quiz: '',
                question: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                category: ''
            });
            setIsAddingQuestion(false);
            refetchQuestions();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (window.confirm('Are you sure you want to delete this quiz? This will also delete all associated questions.')) {
            try {
                // Delete all questions associated with this quiz
                const quizQuestions = questions?.filter(q => q.quiz === quizzes.find(q => q.id === quizId)?.name) || [];
                await Promise.all(quizQuestions.map(q => deleteDoc(doc(db, 'quiz_questions', q.id))));

                // Delete the quiz
                await deleteDoc(doc(db, 'quizes', quizId));
                refetchQuizzes();
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
            await updateDoc(doc(db, 'quizes', quiz.id), {
                use: !quiz.use
            });
            refetchQuizzes();
        } catch (error) {
            console.error('Error toggling quiz:', error);
        }
    };

    if (quizzesLoading || questionsLoading) {
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

                    {isAddingQuestion && (
                        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                            <h3 className="text-xl mb-4">Add New Question</h3>
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
                                        onClick={handleAddQuestion}
                                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                    >
                                        <FiCheck />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsAddingQuestion(false)}
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
                                            onClick={() => {
                                                // TODO: Implement edit functionality
                                            }}
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