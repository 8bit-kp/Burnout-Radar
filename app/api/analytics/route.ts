import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, date, analyticsJSON, journalCount } = await request.json();

    if (!userId || !date || !analyticsJSON) {
      return NextResponse.json(
        { error: 'userId, date, and analyticsJSON are required' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'analytics'), {
      userId,
      date,
      analyticsJSON,
      journalCount: journalCount || 0, // Store how many journals were analyzed
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });

  } catch (error) {
    console.error('Analytics save error:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (date) {
      // Get specific date
      const q = query(
        collection(db, 'analytics'),
        where('userId', '==', userId),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return NextResponse.json({ analytics: null });
      }

      const doc = snapshot.docs[0];
      return NextResponse.json({
        analytics: {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString(),
        }
      });
    } else {
      // Get all analytics for user
      try {
        const q = query(
          collection(db, 'analytics'),
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        
        let analytics = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString(),
        }));

        if (limit) {
          analytics = analytics.slice(0, parseInt(limit));
        }

        console.log(`Returning ${analytics.length} analytics for user ${userId}`);
        return NextResponse.json({ analytics });
      } catch (queryError) {
        // If composite index is missing, try without orderBy
        console.log('Query with orderBy failed, trying without...');
        const q = query(
          collection(db, 'analytics'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        
        let analytics = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString(),
        }));

        // Sort in memory by date descending
        analytics.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        if (limit) {
          analytics = analytics.slice(0, parseInt(limit));
        }

        console.log(`Returning ${analytics.length} analytics (sorted in memory)`);
        return NextResponse.json({ analytics });
      }
    }

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
