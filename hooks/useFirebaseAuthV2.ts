import { useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Enable persistence
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error('Error setting persistence:', err);
    });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setError(null);
      } else {
        // Don't auto sign in - wait for user to log in
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error signing up';
      setError(errorMessage);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error signing in';
      setError(errorMessage);
      throw err;
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);
      // Note: This requires an instance of RecaptchaVerifier
      // Will be handled in the component that uses this
      return phoneNumber;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error with phone sign-in';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error logging out';
      setError(errorMessage);
      throw err;
    }
  };

  return { user, loading, error, signUpWithEmail, signInWithEmail, signInWithPhone, logout };
};
