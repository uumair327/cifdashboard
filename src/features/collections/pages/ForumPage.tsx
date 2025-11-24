/**
 * ForumPage
 * Page for managing forum posts using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { CollectionPage } from './CollectionPage';
import { FormFieldConfig } from '../components/CollectionForm';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define ForumPost interface
interface ForumPost extends BaseCollection {
  title: string;
  description: string;
  userId: string;
}

// Define form fields for forum posts
const forumFormFields: FormFieldConfig[] = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    placeholder: 'Enter forum post title',
    validation: {
      maxLength: 200,
    },
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Enter forum post description',
    validation: {
      maxLength: 2000,
    },
  },
  {
    name: 'userId',
    label: 'User ID',
    type: 'text',
    required: true,
    placeholder: 'Enter user ID',
  },
];

export default function ForumPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const forumRepository = useMemo(
    () => createRepository<ForumPost>('forum'),
    []
  );
  
  return (
    <CollectionPage<ForumPost>
      collectionType="forum"
      title="Forum Posts"
      formFields={forumFormFields}
      repository={forumRepository}
    />
  );
}
