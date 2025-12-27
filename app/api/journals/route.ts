import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, date, text } = await request.json();

    if (!userId || !date || !text) {
      return NextResponse.json(
        { error: 'userId, date, and text are required' },
        { status: 400 }
      );
    }

    // Check if entry already exists for this date
    const q = query(
      collection(db, 'journals'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'Journal entry already exists for this date' },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, 'journals'), {
      userId,
      date,
      text,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });

  } catch (error) {
    console.error('Journal save error:', error);
    return NextResponse.json(
      { error: 'Failed to save journal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (date) {
      // Get specific date
      const q = query(
        collection(db, 'journals'),
        where('userId', '==', userId),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return NextResponse.json({ journal: null });
      }

      const doc = snapshot.docs[0];
      return NextResponse.json({
        journal: {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString(),
        }
      });
    } else {
      // Get all journals for user
      const q = query(
        collection(db, 'journals'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const journals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
      }));

      return NextResponse.json({ journals });
    }

  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}
