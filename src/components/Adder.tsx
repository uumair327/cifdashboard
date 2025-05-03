import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { schemas } from "../schemas";
import { useCollectionData } from "../hooks/useCollectionData";

interface AdderProps {
  collectionName: string;
  onItemAdded?: () => void;
}

interface Quiz {
  id: string;
  name: string;
}

const Adder: React.FC<AdderProps> = ({ collectionName, onItemAdded }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<Record<string, any>[]>([]);
  const { data: quizzes } = useCollectionData('quizes');

  useEffect(() => {
    const schema = schemas[collectionName as keyof typeof schemas];
    if (schema) {
      const initialData: Record<string, any> = {};
      Object.entries(schema).forEach(([key, type]) => {
        initialData[key] = type === Array ? [] : type === Boolean ? false : '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [collectionName]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value === '' || (Array.isArray(value) && value.length === 0)) {
        newErrors[key] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (collectionName === 'quiz_questions') {
          // Add current question to questions array
          setQuestions(prev => [...prev, { ...formData }]);

          // If there are more questions to add
          if (currentQuestionIndex < questionCount - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            // Reset form for next question
            setFormData(prev => ({
              ...prev,
              question: '',
              options: [],
              correctOptionIndex: 0
            }));
          } else {
            // Submit all questions
            const batch = questions.map(q => addDoc(collection(db, collectionName), q));
            await Promise.all(batch);
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setQuestionCount(1);
            if (onItemAdded) onItemAdded();
          }
        } else {
          await addDoc(collection(db, collectionName), formData);
          setFormData({});
          if (onItemAdded) onItemAdded();
        }
        setErrors({});
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const renderField = (key: string, type: any) => {
    const value = formData[key];

    if (collectionName === 'quiz_questions' && key === 'quiz') {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          className={`p-2 rounded bg-slate-700 ${errors[key] ? 'border-red-500 border-2' : ''}`}
        >
          <option value="">Select a quiz</option>
          {quizzes.map((quiz: Quiz) => (
            <option key={quiz.id} value={quiz.name}>
              {quiz.name}
            </option>
          ))}
        </select>
      );
    }

    if (collectionName === 'quiz_questions' && key === 'options') {
      return (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={Array.isArray(value) ? value[index] || '' : ''}
              onChange={(e) => {
                const newOptions = [...(Array.isArray(value) ? value : [])];
                newOptions[index] = e.target.value;
                handleFieldChange(key, newOptions);
              }}
              className={`p-2 rounded bg-slate-700 w-full ${errors[key] ? 'border-red-500 border-2' : ''}`}
            />
          ))}
        </div>
      );
    }

    if (collectionName === 'quiz_questions' && key === 'correctOptionIndex') {
      return (
        <select
          value={value || 0}
          onChange={(e) => handleFieldChange(key, Number(e.target.value))}
          className={`p-2 rounded bg-slate-700 ${errors[key] ? 'border-red-500 border-2' : ''}`}
        >
          {[0, 1, 2, 3].map((index) => (
            <option key={index} value={index}>
              Option {index + 1}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="flex flex-col flex-grow">
        {type === Array ? (
          <textarea
            placeholder={`Enter ${key} (comma-separated)`}
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) => handleFieldChange(key, e.target.value.split(',').map(item => item.trim()))}
            className={`p-2 rounded bg-slate-700 ${errors[key] ? 'border-red-500 border-2' : ''}`}
          />
        ) : type === Boolean ? (
          <select
            value={value?.toString() || 'false'}
            onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
            className={`p-2 rounded bg-slate-700 ${errors[key] ? 'border-red-500 border-2' : ''}`}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
        ) : (
          <input
            type={type === Number ? "number" : "text"}
            placeholder={`Enter ${key}`}
            value={value || ''}
            onChange={(e) => handleFieldChange(key, type === Number ? Number(e.target.value) : e.target.value)}
            className={`p-2 rounded bg-slate-700 ${errors[key] ? 'border-red-500 border-2' : ''}`}
          />
        )}
        {errors[key] && <span className="text-red-500 text-sm mt-1">{errors[key]}</span>}
      </div>
    );
  };

  const schema = schemas[collectionName as keyof typeof schemas];

  if (!schema) {
    return <div>No schema found for this collection</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 max-md:p-2 rounded">
      <h2 className="text-2xl mb-8 max-md:mb-4">Add New Item to {collectionName}</h2>

      {collectionName === 'quiz_questions' && (
        <div className="mb-6">
          <label className="block mb-2">Number of Questions:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            className="p-2 rounded bg-slate-700 w-32"
          />
          <div className="mt-2 text-sm text-slate-400">
            Adding question {currentQuestionIndex + 1} of {questionCount}
          </div>
        </div>
      )}

      {Object.entries(schema).map(([key, type]) => (
        <div key={key} className="mb-4 flex flex-row max-md:flex-col">
          <label className="mr-2 max-md:mr-0 p-2 w-1/4">{key}:</label>
          {renderField(key, type)}
        </div>
      ))}

      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
      >
        {collectionName === 'quiz_questions' && currentQuestionIndex < questionCount - 1
          ? 'Add Next Question'
          : 'Submit'}
      </button>
    </form>
  );
};

export default Adder;