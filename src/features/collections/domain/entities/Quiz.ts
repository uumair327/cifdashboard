/**
 * Quiz domain entities
 */

import { BaseCollection } from './Collection';

/**
 * Quiz entity
 */
export interface Quiz extends BaseCollection {
  name: string;
  thumbnail: string;
  use: boolean;
}

/**
 * Quiz Question entity
 */
export interface QuizQuestion extends BaseCollection {
  quiz: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  category: string;
  explanation?: string;
}
