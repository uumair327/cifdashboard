// Domain entities for collections

import { BaseEntity } from '@/core/types';

export interface BaseCollection extends BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarouselItem extends BaseCollection {
  type: string;
  imageUrl: string;
  link: string;
  thumbnailUrl: string;
}

export interface HomeImage extends BaseCollection {
  image: string;
  url: string;
}

export interface ForumPost extends BaseCollection {
  title: string;
  userId: string;
  description: string;
}

export interface LearnItem extends BaseCollection {
  thumbnail: string;
  name: string;
}

export interface Quiz extends BaseCollection {
  name: string;
  thumbnail: string;
  use: boolean;
}

export interface QuizQuestion extends BaseCollection {
  quiz: string;
  question: string;
  correctOptionIndex: number;
  options: string[];
  category: string;
}

export interface Video extends BaseCollection {
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
}

export type CollectionType =
  | 'carousel_items'
  | 'home_images'
  | 'forum'
  | 'learn'
  | 'quizes'
  | 'quiz_questions'
  | 'quiz'
  | 'videos';

export type CollectionEntity =
  | CarouselItem
  | HomeImage
  | ForumPost
  | LearnItem
  | Quiz
  | QuizQuestion
  | Video;
