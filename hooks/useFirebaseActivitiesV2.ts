import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Activity } from '../types';

export const useFirebaseActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for real-time updates
  useEffect(() => {
    try {
      const q = query(collection(db, 'activities'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const activitiesData: Activity[] = [];
        snapshot.forEach((doc) => {
          activitiesData.push({
            id: doc.id,
            ...doc.data()
          } as Activity);
        });
        // Sort by newest first
        activitiesData.sort((a, b) => {
          const aTime = new Date(a.date).getTime();
          const bTime = new Date(b.date).getTime();
          return bTime - aTime;
        });
        setActivities(activitiesData);
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Error loading activities:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up activities listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: serverTimestamp()
      });
      console.log('Activity created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create activity';
      console.error('Error adding activity:', error);
      setError(errorMessage);
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'activities', id));
      console.log('Activity deleted:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete activity';
      console.error('Error deleting activity:', error);
      setError(errorMessage);
      throw error;
    }
  };

  return { activities, loading, error, addActivity, deleteActivity };
};
