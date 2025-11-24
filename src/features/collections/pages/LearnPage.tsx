/**
 * LearnPage
 * Page for managing learning resources using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { CollectionPage } from './CollectionPage';
import { FormFieldConfig } from '../components/CollectionForm';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define LearnResource interface
interface LearnResource extends BaseCollection {
  name: string;
  thumbnail?: string;
}

// Define form fields for learning resources
const learnFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Resource Name',
    type: 'text',
    required: true,
    placeholder: 'Enter learning resource name',
    validation: {
      maxLength: 200,
    },
  },
  {
    name: 'thumbnail',
    label: 'Thumbnail URL (Optional)',
    type: 'url',
    placeholder: 'https://example.com/thumbnail.jpg',
  },
];

export default function LearnPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const learnRepository = useMemo(
    () => createRepository<LearnResource>('learn'),
    []
  );
  
  return (
    <CollectionPage<LearnResource>
      collectionType="learn"
      title="Learning Resources"
      formFields={learnFormFields}
      repository={learnRepository}
    />
  );
}
