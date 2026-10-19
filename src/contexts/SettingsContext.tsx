import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { DEFAULT_CATEGORIES, type SiteSettings } from '../types';

interface SettingsContextType {
  settings: SiteSettings;
  categories: string[];
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>, updatedByUid: string) => Promise<void>;
  addCategory: (categoryName: string, updatedByUid: string) => Promise<void>;
  removeCategory: (categoryName: string, updatedByUid: string) => Promise<void>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'คลังปัญญา (KlangPanya)',
  siteDescription: 'ศูนย์กลางรวบรวมและแบ่งปันความรู้ สื่อการเรียนรู้ และเนื้อหาทางวิชาการสำหรับทุกคน',
  announcement: 'ยินดีต้อนรับสู่ คลังปัญญา! แพลตฟอร์มแบ่งปันสื่อการสอนและองค์ความรู้เพื่อการศึกษาไทย',
  categories: DEFAULT_CATEGORIES,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'general');

    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            categories: data.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES,
          });
        } else {
          // Document does not exist yet. We do not throw error; we use defaults and try writing if permitted
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Settings onSnapshot error (using fallback defaults):', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>, updatedByUid: string) => {
    const settingsDocRef = doc(db, 'settings', 'general');
    const merged: SiteSettings = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedByUid,
    };
    try {
      await setDoc(settingsDocRef, merged, { merge: true });
      setSettings(merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/general');
    }
  };

  const addCategory = async (categoryName: string, updatedByUid: string) => {
    const clean = categoryName.trim();
    if (!clean || settings.categories.includes(clean)) return;
    const updated = [...settings.categories, clean];
    await updateSettings({ categories: updated }, updatedByUid);
  };

  const removeCategory = async (categoryName: string, updatedByUid: string) => {
    const updated = settings.categories.filter((c) => c !== categoryName);
    await updateSettings({ categories: updated }, updatedByUid);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        categories: settings.categories,
        loading,
        updateSettings,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
