import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { db } from './firebase';
import { Journal, Analytics } from './types';

// Helper to ensure db is available
const getDb = (): Firestore => {
  if (!db) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }
  return db;
};

// Journal operations
export const saveJournal = async (journal: Omit<Journal, 'id'>) => {
  const firestore = getDb();
  const journalRef = doc(collection(firestore, 'journals'));
  await setDoc(journalRef, {
    ...journal,
    createdAt: Timestamp.now(),
  });
  return journalRef.id;
};

export const getJournalByDate = async (userId: string, date: string): Promise<Journal | null> => {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'journals'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  } as Journal;
};

export const getUserJournals = async (userId: string): Promise<Journal[]> => {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'journals'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  })) as Journal[];
};

// Analytics operations
export const saveAnalytics = async (analytics: Omit<Analytics, 'id'>) => {
  const firestore = getDb();
  const analyticsRef = doc(collection(firestore, 'analytics'));
  await setDoc(analyticsRef, {
    ...analytics,
    createdAt: Timestamp.now(),
  });
  return analyticsRef.id;
};

export const getAnalyticsByDate = async (userId: string, date: string): Promise<Analytics | null> => {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'analytics'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  } as Analytics;
};

export const getUserAnalytics = async (userId: string, limit?: number): Promise<Analytics[]> => {
  const firestore = getDb();
  const q = query(
    collection(firestore, 'analytics'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  
  const results = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate().toISOString(),
  })) as Analytics[];
  
  return limit ? results.slice(0, limit) : results;
};
