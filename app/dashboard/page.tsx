'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

interface Journal {
  id: string;
  userId: string;
  date: string;
  text: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [journalText, setJournalText] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fetchingJournals, setFetchingJournals] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && journals.length === 0) {
      fetchJournals();
    }
  }, [user]);

  const fetchJournals = async () => {
    if (!user?.uid || fetchingJournals) return;
    
    setFetchingJournals(true);
    try {
      console.log('Fetching journals for user:', user.uid);
      const startTime = Date.now();
      
      const response = await fetch(`/api/journals?userId=${user.uid}`, {
        cache: 'no-store' // Ensure we get fresh data
      });
      
      if (!response.ok) {
        console.error('Failed to fetch journals:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.journals?.length || 0} journals in ${Date.now() - startTime}ms`);
      setJournals(data.journals || []);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setFetchingJournals(false);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalText.trim() || !selectedDate) {
      setMessage('Please select a date and write something');
      return;
    }

    setLoading(true);
    setSaveSuccess(false);
    
    // Show immediate feedback
    setMessage('💾 Saving...');

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      console.log('Saving journal:', { userId: user?.uid, date: dateStr, textLength: journalText.length });
      
      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          date: dateStr,
          text: journalText,
        }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Show success message immediately
        setSaveSuccess(true);
        setMessage('✓ Journal saved successfully!');
        setLoading(false);
        
        // Update or add the journal in the list (optimistic update)
        const existingIndex = journals.findIndex(j => j.date === dateStr);
        const savedJournal: Journal = {
          id: data.id,
          userId: user!.uid,
          date: dateStr,
          text: journalText,
          createdAt: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          // Update existing
          setJournals(prev => {
            const updated = [...prev];
            updated[existingIndex] = savedJournal;
            return updated;
          });
        } else {
          // Add new
          setJournals(prev => [...prev, savedJournal]);
        }
        
        // Clear form and show the saved journal
        setJournalText('');
        setSelectedDate(null);
        setSelectedJournal(savedJournal);
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          setMessage('');
          setSaveSuccess(false);
        }, 2000);
      } else {
        setMessage('✗ ' + (data.error || 'Failed to save journal'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving journal:', error);
      setMessage('✗ Error saving journal: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  const handleDateClick = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingJournal = journals.find(j => j.date === dateStr);
    
    if (existingJournal) {
      // Show existing journal in view mode
      setSelectedJournal(existingJournal);
      setSelectedDate(null);
      setJournalText('');
    } else {
      // Check if there's a saved journal on the server we don't have locally
      setSelectedDate(date);
      setSelectedJournal(null);
      setJournalText('');
      setLoading(true);
      
      try {
        const response = await fetch(`/api/journals?userId=${user?.uid}&date=${dateStr}`);
        const data = await response.json();
        
        if (data.journal) {
          // Found existing journal on server, show it
          setSelectedJournal(data.journal);
          setSelectedDate(null);
          setJournalText('');
        }
      } catch (error) {
        console.error('Error checking for existing journal:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const hasJournalForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return journals.some(j => j.date === dateStr);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Personal Signal Intelligence</h1>
            <p className="text-sm text-slate-600">Understanding your patterns from daily expression</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => router.push('/journals')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              All Journals
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Analytics
            </button>
            <button
              onClick={() => signOut().then(() => router.push('/login'))}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Journal Calendar</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                  className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50"
                >
                  ←
                </button>
                <span className="px-4 py-1 font-medium text-slate-700">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                  className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for padding */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Calendar days */}
              {daysInMonth.map(day => {
                const hasJournal = hasJournalForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${hasJournal ? 'bg-blue-100 text-blue-900 hover:bg-blue-200' : 'hover:bg-slate-100'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      ${isToday ? 'border-2 border-slate-900' : 'border border-slate-200'}
                      ${!isSameMonth(day, currentDate) ? 'text-slate-400' : 'text-slate-700'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border border-slate-200"></div>
                <span>Has entry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-900 rounded"></div>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Journal Entry/View Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {selectedJournal ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {format(parseISO(selectedJournal.date), 'MMMM d, yyyy')}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setJournalText(selectedJournal.text);
                        setSelectedDate(parseISO(selectedJournal.date));
                        setSelectedJournal(null);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => setSelectedJournal(null)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedJournal.text}</p>
                </div>
              </>
            ) : selectedDate ? (
              <>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  {journals.some(j => j.date === format(selectedDate, 'yyyy-MM-dd')) ? 'Edit' : 'New'} Entry: {format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                
                {message && (
                  <div className={`mb-4 px-4 py-3 rounded ${
                    message.includes('success') || message.includes('✓')
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : message.includes('Saving')
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'bg-amber-50 border border-amber-200 text-amber-700'
                  }`}>
                    {message}
                  </div>
                )}

                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Write about your day, thoughts, experiences..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-slate-500"
                />

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleSaveJournal}
                    disabled={loading || !journalText.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? 'Saving...' : journals.some(j => j.date === format(selectedDate, 'yyyy-MM-dd')) ? 'Update Journal Entry' : 'Save Journal Entry'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setJournalText('');
                      setMessage('');
                    }}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2">Click a date to view or create a journal entry</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
