/**
 * Forum Domain Entities
 * Matches Flutter app forum structure
 */

export type ForumCategory = 'parent' | 'children';

export interface Forum {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  category: ForumCategory;
}

export interface Comment {
  id: string;
  userId: string;
  forumId: string;
  text: string;
  createdAt: Date;
}

export interface UserDetails {
  userName: string;
  userImage: string;
  userEmail: string;
  role: string;
}
