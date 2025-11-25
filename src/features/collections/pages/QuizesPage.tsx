/**
 * QuizesPage
 * Page for managing quizzes using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { CollectionPage } from './CollectionPage';
import { FormFieldConfig } from '../components/CollectionForm';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define Quiz interface
interface Quiz extends BaseCollection {
  name: string;
  thumbnail?: string;
  use?: string;
}

// Define form fields for quizzes
const quizFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Quiz Name',
    type: 'text',
    required: true,
    placeholder: 'Enter quiz name',
    validation: {
      maxLength: 200,
    },
  },
  {
    name: 'thumbnail',
    label: 'Thumbnail URL (Optional)',
    type: 'url',
    placeholder: 'https://example.com/quiz-thumbnail.jpg',
  },
  {
    name: 'use',
    label: 'Usage/Purpose (Optional)',
    type: 'text',
    placeholder: 'Enter quiz purpose or usage',
    validation: {
      maxLength: 500,
    },
  },
];

export default function QuizesPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const quizesRepository = useMemo(
    () => createRepository<Quiz>('quizes'),
    []
  );
  
  return (
    <CollectionPage<Quiz>
      collectionType="quizes"
      title="Quizzes"
      formFields={quizFormFields}
      repository={quizesRepository}
    />
  );
}
