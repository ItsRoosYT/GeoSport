import { useState, useEffect } from 'react';
import { db, activitiesCollection } from '../firebase-config';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Activity } from '../types';

export const useFirebaseActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for real-time updates
  useEffect(() => {
    const q = query(collection(db, 'activities'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData: Activity[] = [];
      snapshot.forEach((doc) => {
        activitiesData.push({
          id: doc.id,
          ...doc.data()
        } as Activity);
      });
      setActivities(activitiesData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading activities:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'activities'), activity);
      return docRef.id;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  };

  return { activities, loading, addActivity, deleteActivity };
};
