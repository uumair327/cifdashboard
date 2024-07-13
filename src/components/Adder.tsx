import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { schemas } from "../schemas";

interface AdderProps {
  collectionName: string;
  onItemAdded?: () => void;
}

const Adder: React.FC<AdderProps> = ({ collectionName, onItemAdded }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    // Clear error when field is modified
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
        await addDoc(collection(db, collectionName), formData);
        setFormData({}); // Reset form
        setErrors({});
        if (onItemAdded) onItemAdded();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const renderField = (key: string, type: any) => {
    const value = formData[key];
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
      {Object.entries(schema).map(([key, type]) => (
        <div key={key} className="mb-4 flex flex-row max-md:flex-col">
          <label className="mr-2 max-md:mr-0 p-2 w-1/4">{key}:</label>
          {renderField(key, type)}
        </div>
      ))}
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default Adder;