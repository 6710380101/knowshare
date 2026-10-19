import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { FavoriteItem, Resource } from '../types';

const COLLECTION_NAME = 'favorites';

export const favoriteService = {
  // Get all favorites for a user
  async getUserFavorites(userId: string): Promise<FavoriteItem[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FavoriteItem, 'id'>),
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTION_NAME);
    }
  },

  // Check if a specific resource is favorited by user
  async isFavorited(userId: string, resourceId: string): Promise<boolean> {
    try {
      const favId = `${userId}_${resourceId}`;
      const docRef = doc(db, COLLECTION_NAME, favId);
      const snap = await getDoc(docRef);
      return snap.exists();
    } catch (err) {
      console.warn('Check favorite error:', err);
      return false;
    }
  },

  // Toggle favorite: returns true if favorited, false if removed
  async toggleFavorite(userId: string, resource: Resource): Promise<boolean> {
    const favId = `${userId}_${resource.id}`;
    const favDocRef = doc(db, COLLECTION_NAME, favId);
    const resourceDocRef = doc(db, 'resources', resource.id);

    try {
      const snap = await getDoc(favDocRef);
      if (snap.exists()) {
        // Remove favorite
        await deleteDoc(favDocRef);
        // Decrease resource favoriteCount safely
        const resSnap = await getDoc(resourceDocRef);
        if (resSnap.exists()) {
          const count = Math.max(0, (resSnap.data().favoriteCount || 1) - 1);
          await updateDoc(resourceDocRef, { favoriteCount: count });
        }
        return false;
      } else {
        // Add favorite
        const newFav: Omit<FavoriteItem, 'id'> = {
          userId,
          resourceId: resource.id,
          resourceTitle: resource.title,
          resourceCategory: resource.category,
          createdAt: new Date().toISOString(),
        };
        await setDoc(favDocRef, newFav);
        // Increase resource favoriteCount
        const resSnap = await getDoc(resourceDocRef);
        if (resSnap.exists()) {
          const count = (resSnap.data().favoriteCount || 0) + 1;
          await updateDoc(resourceDocRef, { favoriteCount: count });
        }
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${COLLECTION_NAME}/${favId}`);
    }
  },
};
