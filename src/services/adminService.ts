import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { UserProfile, UserRole, ModerationLog } from '../types';

export const adminService = {
  // Get all registered users
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<UserProfile, 'uid'>),
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  },

  // Change user role
  async updateUserRole(targetUid: string, newRole: UserRole, admin: UserProfile): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', targetUid);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // Write moderation log
      await this.logModerationAction({
        action: 'change_role',
        targetType: 'user',
        targetId: targetUid,
        details: `เปลี่ยนบทบาทเป็น ${newRole}`,
        performedBy: admin.uid,
        performedByEmail: admin.email,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  },

  // Toggle user suspension
  async toggleUserSuspension(targetUid: string, isSuspended: boolean, admin: UserProfile): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', targetUid);
      await updateDoc(userDocRef, {
        isSuspended,
        updatedAt: new Date().toISOString(),
      });

      await this.logModerationAction({
        action: isSuspended ? 'suspend_user' : 'unsuspend_user',
        targetType: 'user',
        targetId: targetUid,
        details: isSuspended ? 'ระงับบัญชีผู้ใช้งาน' : 'ปลดการระงับบัญชีผู้ใช้งาน',
        performedBy: admin.uid,
        performedByEmail: admin.email,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  },

  // Log moderation actions
  async logModerationAction(log: Omit<ModerationLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      const newDocRef = doc(collection(db, 'moderationLogs'));
      const fullLog: Omit<ModerationLog, 'id'> = {
        ...log,
        createdAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, fullLog);
    } catch (err) {
      console.warn('Logging moderation action error:', err);
    }
  },

  // Get moderation logs
  async getModerationLogs(): Promise<ModerationLog[]> {
    try {
      const snap = await getDocs(collection(db, 'moderationLogs'));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ModerationLog, 'id'>),
      }));
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'moderationLogs');
    }
  },
};
