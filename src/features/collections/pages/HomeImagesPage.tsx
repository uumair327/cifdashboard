/**
 * HomeImagesPage
 * Page for managing home images using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { CollectionPage } from './CollectionPage';
import { FormFieldConfig } from '../components/CollectionForm';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define HomeImage interface
interface HomeImage extends BaseCollection {
  image: string;
  url?: string;
}

// Define form fields for home images
const homeImageFormFields: FormFieldConfig[] = [
  {
    name: 'image',
    label: 'Image URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/home-image.jpg',
  },
  {
    name: 'url',
    label: 'Link URL (Optional)',
    type: 'url',
    placeholder: 'https://example.com/link',
  },
];

export default function HomeImagesPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const homeImagesRepository = useMemo(
    () => createRepository<HomeImage>('home_images'),
    []
  );
  
  return (
    <CollectionPage<HomeImage>
      collectionType="home_images"
      title="Home Images"
      formFields={homeImageFormFields}
      repository={homeImagesRepository}
    />
  );
}
