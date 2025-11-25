/**
 * Forum Repository Interface
 * Defines operations for forum data access
 */

import { Forum, Comment, UserDetails, ForumCategory } from '../entities/Forum';

export interface IForumRepository {
  /**
   * Get forums by category (real-time subscription)
   */
  getForums(category: ForumCategory, onUpdate: (forums: Forum[]) => void, onError: (error: Error) => void): () => void;

  /**
   * Get comments for a forum post (real-time subscription)
   */
  getComments(forumId: string, onUpdate: (comments: Comment[]) => void, onError: (error: Error) => void): () => void;

  /**
   * Add a comment to a forum post
   */
  addComment(forumId: string, text: string, userId: string): Promise<void>;

  /**
   * Get user details
   */
  getUserDetails(userId: string): Promise<UserDetails>;

  /**
   * Create a new forum post
   */
  createForum(title: string, description: string, category: ForumCategory, userId: string): Promise<string>;

  /**
   * Delete a forum post and all its comments
   */
  deleteForum(forumId: string): Promise<void>;

  /**
   * Delete a comment
   */
  deleteComment(forumId: string, commentId: string): Promise<void>;
}
