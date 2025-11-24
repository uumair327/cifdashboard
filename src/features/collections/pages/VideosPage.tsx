/**
 * VideosPage
 * Page for managing videos using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { CollectionPage } from './CollectionPage';
import { FormFieldConfig } from '../components/CollectionForm';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define Video interface
interface Video extends BaseCollection {
  title: string;
  category: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

// Define form fields for videos
const videoFormFields: FormFieldConfig[] = [
  {
    name: 'title',
    label: 'Video Title',
    type: 'text',
    required: true,
    placeholder: 'Enter video title',
    validation: {
      maxLength: 200,
    },
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    required: true,
    placeholder: 'Enter video category',
    validation: {
      maxLength: 100,
    },
  },
  {
    name: 'thumbnailUrl',
    label: 'Thumbnail URL (Optional)',
    type: 'url',
    placeholder: 'https://example.com/video-thumbnail.jpg',
  },
  {
    name: 'videoUrl',
    label: 'Video URL (Optional)',
    type: 'url',
    placeholder: 'https://example.com/video.mp4',
  },
];

export default function VideosPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const videosRepository = useMemo(
    () => createRepository<Video>('videos'),
    []
  );
  
  return (
    <CollectionPage<Video>
      collectionType="videos"
      title="Videos"
      formFields={videoFormFields}
      repository={videosRepository}
    />
  );
}
