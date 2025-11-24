/**
 * CarouselItemsPage
 * Page for managing carousel items using the new CollectionPage architecture
 */
import { useMemo } from 'react';
import { SimpleCollectionPage } from './SimpleCollectionPage';
import { createRepository } from '../data';
import { BaseCollection } from '../domain/entities/Collection';

// Define CarouselItem interface
interface CarouselItem extends BaseCollection {
  type: string;
  imageUrl: string;
  thumbnailUrl?: string;
  link?: string;
}

export default function CarouselItemsPage() {
  // Create repository using factory (memoized to prevent recreation on every render)
  const carouselRepository = useMemo(
    () => createRepository<CarouselItem>('carousel_items'),
    []
  );
  
  return (
    <SimpleCollectionPage<CarouselItem>
      title="Carousel Items"
      collectionName="carousel_items"
      repository={carouselRepository}
      fields={['type', 'imageUrl', 'thumbnailUrl', 'link']}
    />
  );
}
