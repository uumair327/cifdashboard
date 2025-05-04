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
          setQuestions(prev => [...prev, { ...formData }]);
          if (currentQuestionIndex < questionCount - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setFormData(prev => ({
              ...prev,
              question: '',
              options: [],
              correctOptionIndex: 0
            }));
          } else {
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
          className={`w-full p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
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
            <div key={index} className="flex gap-2 items-center">
              <input
                type="radio"
                checked={value === index}
                onChange={() => handleFieldChange(key, index)}
                className="mt-0"
              />
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={Array.isArray(value) ? value[index] || '' : ''}
                onChange={(e) => {
                  const newOptions = [...(Array.isArray(value) ? value : [])];
                  newOptions[index] = e.target.value;
                  handleFieldChange(key, newOptions);
                }}
                className={`flex-1 p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
              />
            </div>
          ))}
        </div>
      );
    }

    if (collectionName === 'quiz_questions' && key === 'correctOptionIndex') {
      return (
        <select
          value={value || 0}
          onChange={(e) => handleFieldChange(key, Number(e.target.value))}
          className={`w-full p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
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
            className={`w-full p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
            rows={3}
          />
        ) : type === Boolean ? (
          <select
            value={value?.toString() || 'false'}
            onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
            className={`w-full p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
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
            className={`w-full p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm md:text-base ${errors[key] ? 'border-red-500 border-2' : ''}`}
          />
        )}
        {errors[key] && <span className="text-red-500 text-xs md:text-sm mt-1">{errors[key]}</span>}
      </div>
    );
  };

  const schema = schemas[collectionName as keyof typeof schemas];

  if (!schema) {
    return <div className="text-slate-900 dark:text-white">No schema found for this collection</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-100 dark:bg-slate-800 p-3 md:p-4 rounded">
      <h2 className="text-xl md:text-2xl mb-4 md:mb-8 text-slate-900 dark:text-white">Add New Item to {collectionName}</h2>

      {collectionName === 'quiz_questions' && (
        <div className="mb-4 md:mb-6">
          <label className="block mb-2 text-sm md:text-base text-slate-900 dark:text-white">Number of Questions:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            className="p-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white w-24 md:w-32 text-sm md:text-base"
          />
          <div className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Adding question {currentQuestionIndex + 1} of {questionCount}
          </div>
        </div>
      )}

      {Object.entries(schema).map(([key, type]) => (
        <div key={key} className="mb-3 md:mb-4 flex flex-col md:flex-row gap-2 md:gap-0">
          <label className="p-2 text-sm md:text-base w-full md:w-1/4 text-slate-900 dark:text-white">{key}:</label>
          <div className="w-full md:w-3/4">
            {renderField(key, type)}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full md:w-auto bg-green-500 text-white px-3 md:px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm md:text-base"
      >
        {collectionName === 'quiz_questions' && currentQuestionIndex < questionCount - 1
          ? 'Add Next Question'
          : 'Submit'}
      </button>
    </form>
  );
};

export default Adder;