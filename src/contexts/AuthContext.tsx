import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  type User
} from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isSuspended: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin bootstrap email from user metadata
const ADMIN_BOOTSTRAP_EMAIL = 't.gan5140@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile document from Firestore
  const fetchOrCreateProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Auto-elevate to admin if matches bootstrap email and not yet admin
        if (user.email === ADMIN_BOOTSTRAP_EMAIL && data.role !== 'admin') {
          await setDoc(userRef, { ...data, role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
          const updated: UserProfile = { ...data, role: 'admin' };
          setUserProfile(updated);
          return updated;
        }
        setUserProfile(data);
        return data;
      } else {
        // Create initial profile
        const isBootstrapAdmin = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
          role: isBootstrapAdmin ? 'admin' : 'member',
          isSuspended: false,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
        return initialProfile;
      }
    } catch (err) {
      console.error('Error fetching/creating user profile:', err);
      // Fallback local representation if offline/permission issue
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'ผู้ใช้งาน',
        role: user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'admin' : 'member',
        isSuspended: false,
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await fetchOrCreateProfile(cred.user);
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (e) {
        console.warn('Could not send verification email immediately', e);
      }
    }
    await fetchOrCreateProfile(cred.user);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await fetchOrCreateProfile(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrCreateProfile(currentUser);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const isModerator = isAdmin || userProfile?.role === 'moderator';
  const isSuspended = !!userProfile?.isSuspended;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isModerator,
        isSuspended,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        resendVerificationEmail,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
