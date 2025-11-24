// Field visibility configuration for collections

import { CollectionType } from '../entities/Collection';

export interface FieldVisibilityConfig {
  collectionType: CollectionType;
  defaultFields: string[];      // Always visible in table view
  expandableFields: string[];   // Visible in detail/expanded view
  hiddenFields: string[];        // Never shown in UI
  searchableFields?: string[];  // Fields that can be searched
  sortableFields?: string[];    // Fields that can be sorted
}

/**
 * Field visibility configurations for each collection type
 */
export const FIELD_CONFIGS: Record<CollectionType, FieldVisibilityConfig> = {
  carousel_items: {
    collectionType: 'carousel_items',
    defaultFields: ['type', 'imageUrl', 'link'],
    expandableFields: ['thumbnailUrl', 'createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['type', 'link'],
    sortableFields: ['type', 'createdAt', 'updatedAt'],
  },
  home_images: {
    collectionType: 'home_images',
    defaultFields: ['image', 'url'],
    expandableFields: ['createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['url'],
    sortableFields: ['url', 'createdAt', 'updatedAt'],
  },
  forum: {
    collectionType: 'forum',
    defaultFields: ['title', 'userId', 'description'],
    expandableFields: ['createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['title', 'description', 'userId'],
    sortableFields: ['title', 'userId', 'createdAt', 'updatedAt'],
  },
  learn: {
    collectionType: 'learn',
    defaultFields: ['name', 'thumbnail'],
    expandableFields: ['createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['name'],
    sortableFields: ['name', 'createdAt', 'updatedAt'],
  },
  quizes: {
    collectionType: 'quizes',
    defaultFields: ['name', 'thumbnail', 'use'],
    expandableFields: ['createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['name'],
    sortableFields: ['name', 'use', 'createdAt', 'updatedAt'],
  },
  quiz_questions: {
    collectionType: 'quiz_questions',
    defaultFields: ['quiz', 'question', 'category'],
    expandableFields: ['options', 'correctOptionIndex', 'createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['quiz', 'question', 'category'],
    sortableFields: ['quiz', 'question', 'category', 'createdAt', 'updatedAt'],
  },
  videos: {
    collectionType: 'videos',
    defaultFields: ['title', 'category', 'thumbnailUrl'],
    expandableFields: ['videoUrl', 'createdAt', 'updatedAt'],
    hiddenFields: ['id'],
    searchableFields: ['title', 'category'],
    sortableFields: ['title', 'category', 'createdAt', 'updatedAt'],
  },
};

/**
 * Get visible fields for a collection type and view mode
 */
export function getVisibleFields(
  collectionType: CollectionType,
  viewMode: 'table' | 'detail' = 'table'
): string[] {
  const config = FIELD_CONFIGS[collectionType];
  
  if (viewMode === 'table') {
    return config.defaultFields;
  } else {
    return [...config.defaultFields, ...config.expandableFields];
  }
}

/**
 * Check if a field should be hidden
 */
export function isFieldHidden(collectionType: CollectionType, fieldName: string): boolean {
  const config = FIELD_CONFIGS[collectionType];
  return config.hiddenFields.includes(fieldName);
}

/**
 * Filter out empty fields from an item
 */
export function filterEmptyFields<T extends Record<string, any>>(item: T): Partial<T> {
  const filtered: Partial<T> = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (value !== null && value !== undefined && value !== '') {
      filtered[key as keyof T] = value;
    }
  }
  
  return filtered;
}
