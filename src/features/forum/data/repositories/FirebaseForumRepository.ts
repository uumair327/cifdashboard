/**
 * Firebase Forum Repository Implementation
 * Implements forum data access using Firebase Firestore
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import { IForumRepository } from '../../domain/repositories/IForumRepository';
import { Forum, Comment, UserDetails, ForumCategory } from '../../domain/entities/Forum';
import { logger } from '../../../../core/utils/logger';

export class FirebaseForumRepository implements IForumRepository {
  getForums(
    category: ForumCategory,
    onUpdate: (forums: Forum[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const forumsRef = collection(db, 'forum');
    const q = query(
      forumsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const forums: Forum[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            createdAt: new Date(data.createdAt),
            category: data.category as ForumCategory,
          };
        });
        onUpdate(forums);
      },
      (error) => {
        logger.error('Error fetching forums:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  }

  getComments(
    forumId: string,
    onUpdate: (comments: Comment[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const commentsRef = collection(db, 'forum', forumId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments: Comment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.id,
            userId: data.userId,
            forumId: data.forumId,
            text: data.text,
            createdAt: new Date(data.createdAt),
          };
        });
        onUpdate(comments);
      },
      (error) => {
        logger.error('Error fetching comments:', error);
        onError(error as Error);
      }
    );

    return unsubscribe;
  }

  async addComment(forumId: string, text: string, userId: string): Promise<void> {
    const commentId = Date.now().toString();
    const commentRef = doc(db, 'forum', forumId, 'comments', commentId);

    const comment: Comment = {
      id: commentId,
      userId,
      forumId,
      text,
      createdAt: new Date(),
    };

    await setDoc(commentRef, {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    });
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          userName: 'Anonymous',
          userImage: '',
          userEmail: 'anonymous@mail.com',
          role: 'child',
        };
      }

      const data = userDoc.data();
      return {
        userName: data.userName || 'Anonymous',
        userImage: data.userImage || '',
        userEmail: data.userEmail || 'anonymous@mail.com',
        role: data.role || 'child',
      };
    } catch (error) {
      logger.error('Error fetching user details:', error);
      return {
        userName: 'Anonymous',
        userImage: '',
        userEmail: 'anonymous@mail.com',
        role: 'child',
      };
    }
  }

  async createForum(
    title: string,
    description: string,
    category: ForumCategory,
    userId: string
  ): Promise<string> {
    const forumId = Date.now().toString();
    const forumRef = doc(db, 'forum', forumId);

    const forum: Forum = {
      id: forumId,
      userId,
      title,
      description,
      createdAt: new Date(),
      category,
    };

    await setDoc(forumRef, {
      ...forum,
      createdAt: forum.createdAt.toISOString(),
    });

    return forumId;
  }

  async deleteForum(forumId: string): Promise<void> {
    // Delete all comments first
    const commentsRef = collection(db, 'forum', forumId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);

    const deletePromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the forum
    const forumRef = doc(db, 'forum', forumId);
    await deleteDoc(forumRef);
  }

  async deleteComment(forumId: string, commentId: string): Promise<void> {
    const commentRef = doc(db, 'forum', forumId, 'comments', commentId);
    await deleteDoc(commentRef);
  }
}
