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
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { ReportItem, ReportReason, ReportStatus, UserProfile } from '../types';

const COLLECTION_NAME = 'reports';

export const reportService = {
  // Create report
  async createReport(
    data: {
      resourceId: string;
      resourceTitle: string;
      reason: ReportReason;
      details: string;
    },
    reporter: UserProfile
  ): Promise<string> {
    try {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const newReport: Omit<ReportItem, 'id'> = {
        resourceId: data.resourceId,
        resourceTitle: data.resourceTitle,
        reporterId: reporter.uid,
        reporterEmail: reporter.email,
        reason: data.reason,
        details: data.details.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, newReport);
      return newDocRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  // Get reports (for moderators/admins)
  async getReports(statusFilter?: ReportStatus): Promise<ReportItem[]> {
    try {
      const refCol = collection(db, COLLECTION_NAME);
      let q = query(refCol);
      if (statusFilter) {
        q = query(refCol, where('status', '==', statusFilter));
      }
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ReportItem, 'id'>),
      }));

      // Sort by creation date descending
      return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTION_NAME);
    }
  },

  // Update report status (resolve or dismiss)
  async updateReportStatus(reportId: string, status: ReportStatus, moderator: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, reportId);
      await updateDoc(docRef, {
        status,
        resolvedAt: new Date().toISOString(),
        resolvedBy: moderator.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${reportId}`);
    }
  },

  // Delete report (admin only)
  async deleteReport(reportId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, reportId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${reportId}`);
    }
  },
};
