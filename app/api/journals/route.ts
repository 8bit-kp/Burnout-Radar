import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';

export async function POST(request: NextRequest) {
  console.log('🔷 POST /api/journals - Request received');
  
  try {
    console.log('🔷 Parsing request body...');
    const { userId, date, text } = await request.json();
    console.log('🔷 Request body parsed:', { userId, date, textLength: text?.length });

    if (!userId || !date || !text) {
      console.log('🔴 Validation failed - missing fields');
      return NextResponse.json(
        { error: 'userId, date, and text are required' },
        { status: 400 }
      );
    }

    // Check if db is initialized
    if (!db) {
      console.error('🔴 Firestore not initialized - check Firebase configuration');
      return NextResponse.json(
        { error: 'Database not configured. Please check Firebase environment variables.' },
        { status: 500 }
      );
    }

    console.log('🔷 Checking for existing journal...');
    // Check if entry already exists for this date
    const q = query(
      collection(db, 'journals'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const existing = await getDocs(q);
    console.log('🔷 Existing check complete:', existing.empty ? 'No duplicate' : 'Found existing journal');

    let docId: string;

    if (!existing.empty) {
      // Update existing journal
      const existingDoc = existing.docs[0];
      docId = existingDoc.id;
      console.log('🔷 Updating existing journal:', docId);
      
      await updateDoc(doc(db, 'journals', docId), {
        text,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Journal updated successfully:', { id: docId, date, userId });
    } else {
      // Create new journal
      console.log('🔷 Adding new journal to Firestore...');
      const docRef = await addDoc(collection(db, 'journals'), {
        userId,
        date,
        text,
        createdAt: Timestamp.now(),
      });
      docId = docRef.id;
      console.log('✅ Journal created successfully:', { id: docId, date, userId });
    }

    console.log('🔷 Invalidating cache...');
    // Invalidate cache for this user's journals (WAIT for it to complete)
    try {
      await cacheDel(`journals:${userId}`);
      console.log('✅ Cache invalidated successfully');
    } catch (err) {
      console.warn('⚠️ Failed to invalidate cache, but journal was saved:', err);
    }

    console.log('✅ Returning success response');
    return NextResponse.json({ 
      success: true, 
      id: docId 
    });

  } catch (error) {
    console.error('🔴 Journal save error:', error);
    
    // Check for Firestore permission errors
    if (error instanceof Error && error.message.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { error: 'Firestore API is not enabled. Please enable Cloud Firestore in your Firebase console.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save journal: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if db is initialized
    if (!db) {
      console.error('Firestore not initialized - check Firebase configuration');
      return NextResponse.json(
        { error: 'Database not configured. Please check Firebase environment variables.' },
        { status: 500 }
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
      console.log('Fetching journals for user:', userId);
      const startTime = Date.now();
      
      // Try cache first (unless force refresh requested)
      const cacheKey = `journals:${userId}`;
      const cached = !forceRefresh ? await cacheGet(cacheKey) : null;
      
      if (cached) {
        console.log(`✓ Cache hit - returned in ${Date.now() - startTime}ms`);
        return NextResponse.json({ journals: JSON.parse(cached) });
      }
      
      console.log(forceRefresh ? 'Force refresh - bypassing cache' : 'Cache miss - querying Firestore');
      
      try {
        // Try with orderBy first (requires composite index)
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

        // Cache for 5 minutes (300 seconds)
        await cacheSet(cacheKey, JSON.stringify(journals), 300);

        console.log(`✓ Fetched ${journals.length} journals from Firestore in ${Date.now() - startTime}ms (cached)`);
        return NextResponse.json({ journals });
        
      } catch (indexError: any) {
        // If composite index doesn't exist, fallback to simple query and sort in memory
        console.warn('Composite index not found, using fallback query:', indexError.message);
        
        const q = query(
          collection(db, 'journals'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        
        const journals = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
          }))
          .sort((a: any, b: any) => b.date.localeCompare(a.date)); // Sort in memory

        // Cache for 5 minutes
        await cacheSet(cacheKey, JSON.stringify(journals), 300);

        console.log(`✓ Fetched ${journals.length} journals (fallback) in ${Date.now() - startTime}ms (cached)`);
        return NextResponse.json({ journals });
      }
    }

  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
